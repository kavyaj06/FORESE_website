/**
 * The resume drop box, from the public side.
 *
 * A student picks a PDF on `/tips/resume` and it lands in Firestore, where
 * only the club's account can read it. Three decisions are worth writing down.
 *
 * **The file is stored in Firestore, not in a bucket.** Firebase Storage would
 * be the obvious home and was rejected: Google has required a billing account
 * on the project since February 2026 before Storage turns on at all, which is
 * the wrong thing to ask of a club expecting a few dozen files. Cloudinary,
 * where the gallery's photographs go, was rejected for the opposite reason:
 * everything its unsigned preset accepts is readable by anyone holding the
 * URL, and a resume carries a phone number and a home address. Firestore has
 * neither problem, and its rules say exactly what the club asked for: anyone
 * may drop a file in, only the club may read one.
 *
 * The cost of that choice is the 1MB document limit, which becomes the file
 * size limit. A one page resume out of Word, Google Docs or LaTeX is 50KB to
 * 300KB, so it fits with room to spare; something exported out of a design
 * tool with full page images may not, and is refused here with a sentence
 * saying what to do about it rather than a failure the student cannot act on.
 *
 * **REST, not the SDK.** `@/data/remote` makes this argument already: pulling
 * `firebase/firestore` into the public bundle to do one write would put ~100KB
 * of SDK in front of every visitor. An unauthenticated request carries no
 * `request.auth`, which is precisely the case the `allow create` rule is
 * written for.
 *
 * **Two documents, one commit.** The metadata and the bytes are separate
 * collections sharing an id, so the club's inbox can list fifty submissions
 * without downloading fifty PDFs. They go up in a single `:commit` so a
 * submission cannot half exist, and each write asserts the document does not
 * exist yet, so this endpoint can only ever add.
 */

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

/** Whether there is a project to send to at all. The section hides itself if not. */
export const resumeDropConfigured = Boolean(PROJECT_ID && API_KEY);

/**
 * The largest file the drop box takes.
 *
 * A Firestore document is capped at 1,048,576 bytes and a bytes field counts
 * its own length plus one, so a million bytes of PDF leaves about 48KB of
 * headroom for the field name and the document path. The rule enforces the
 * same number on the server; this copy is what lets the page refuse a file
 * before anything is uploaded.
 */
export const MAX_BYTES = 1_000_000;

/** The id Firestore files both halves of a submission under. */
function newId(): string {
  // `randomUUID` needs a secure context. The site is HTTPS everywhere, but a
  // developer on plain `http://` is a real case and a crash there would be a
  // confusing one.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * The file's own name, made safe to store and read back.
 *
 * Kept because it is the only label the club's inbox has to show. The rule
 * caps it at 200 characters; this trims well under that and drops the control
 * characters a crafted file name could otherwise carry into the editor.
 */
function safeName(name: string): string {
  const cleaned = name.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return (cleaned || 'resume.pdf').slice(0, 120);
}

/** A file's size, said the way a person would say it. */
export function describeSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

export type RejectionReason = 'type' | 'size' | 'empty';

/**
 * Why this file cannot be sent, or `null` if it can.
 *
 * Both checks are repeated by the security rules, which are the enforcement.
 * These exist so the student hears about it immediately instead of after
 * uploading a megabyte on college wifi.
 */
export function rejectionFor(file: File): RejectionReason | null {
  const looksLikePdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (!looksLikePdf) return 'type';
  if (file.size === 0) return 'empty';
  if (file.size > MAX_BYTES) return 'size';
  return null;
}

/** The file as base64, which is how REST carries a bytes field. */
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read-failed'));
    // `readAsDataURL` rather than `btoa(String.fromCharCode(...))`: spreading a
    // million-element byte array into a call overflows the stack.
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.readAsDataURL(file);
  });
}

export type SubmitFailure = 'closed' | 'failed';

function documentPath(collection: string, id: string): string {
  return `projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${id}`;
}

/**
 * Send one resume.
 *
 * Resolves when both documents are written. Rejects with a `SubmitFailure`:
 * `closed` means the rules refused it, which on a fresh project means they
 * have not been republished yet and is worth saying differently from a
 * connection that dropped.
 */
export function submitResume(file: File, onProgress: (fraction: number) => void): Promise<void> {
  return toBase64(file).then(
    (bytes) =>
      new Promise<void>((resolve, reject) => {
        const id = newId();
        const body = JSON.stringify({
          writes: [
            {
              update: {
                name: documentPath('resume_uploads', id),
                fields: {
                  name: { stringValue: safeName(file.name) },
                  size: { integerValue: String(file.size) },
                  // An ISO string rather than a timestamp: it sorts
                  // lexicographically, which is all the inbox needs, and it
                  // saves the admin page a Timestamp conversion on every row.
                  uploadedAt: { stringValue: new Date().toISOString() },
                },
              },
              currentDocument: { exists: false },
            },
            {
              update: {
                name: documentPath('resume_files', id),
                fields: { file: { bytesValue: bytes } },
              },
              currentDocument: { exists: false },
            },
          ],
        });

        const request = new XMLHttpRequest();
        request.open(
          'POST',
          `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit?key=${API_KEY}`,
        );
        request.setRequestHeader('Content-Type', 'application/json');

        // XHR rather than `fetch` for this one reason: it reports upload
        // progress, and on college wifi a megabyte is long enough that a
        // button saying nothing reads as a page that has frozen.
        request.upload.onprogress = (event) => {
          if (event.lengthComputable) onProgress(event.loaded / event.total);
        };

        request.onload = () => {
          if (request.status >= 200 && request.status < 300) {
            onProgress(1);
            resolve();
            return;
          }
          reject(new Error(request.status === 403 ? 'closed' : 'failed'));
        };
        request.onerror = () => reject(new Error('failed'));
        request.ontimeout = () => reject(new Error('failed'));

        request.send(body);
      }),
    () => Promise.reject(new Error('failed')),
  );
}
