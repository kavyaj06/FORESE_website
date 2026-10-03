import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore/lite';
import { firestore } from '@/lib/firebase';
import type { ForeseEvent } from '@/data/events';
import type { GalleryAlbum } from '@/pages/gallery/data';

/**
 * Everything the admin page writes, in one file.
 *
 * The documents are the site's own interfaces field for field — `ForeseEvent`
 * here, `GalleryPhoto` plus an `eventId` for photographs. There is no mapping
 * layer and deliberately so: the reader (`@/data/remote`) decodes the same
 * names, so a field added to the interface is a field both ends already agree
 * about, and one that is renamed breaks at the type level rather than
 * silently.
 */

export interface PhotoRow {
  id: string;
  eventId: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  circulate: boolean;
  order: number;
}

const EVENTS = 'events';
const PHOTOS = 'album_photos';

function db(): Firestore {
  return firestore();
}

export async function listEvents(): Promise<ForeseEvent[]> {
  const snapshot = await getDocs(collection(db(), EVENTS));
  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as ForeseEvent)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

export async function listPhotos(): Promise<PhotoRow[]> {
  const snapshot = await getDocs(collection(db(), PHOTOS));
  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as PhotoRow)
    .sort((a, b) => a.order - b.order);
}

/**
 * Write an event.
 *
 * The document id *is* the event id, which is what the gallery's photographs
 * reference and what `findEvent()` looks up. Keeping them the same means
 * there is no second identifier to keep in step.
 *
 * `undefined` is stripped rather than stored: Firestore rejects it, and an
 * absent optional field is exactly what the interface means by one.
 */
export async function saveEvent(event: ForeseEvent): Promise<void> {
  const payload = Object.fromEntries(
    Object.entries(event).filter(([, value]) => value !== undefined && value !== ''),
  );
  await setDoc(doc(db(), EVENTS, event.id), { ...payload, date: event.date ?? null });
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db(), EVENTS, id));
}

export async function savePhoto(photo: PhotoRow): Promise<void> {
  const { id, ...rest } = photo;
  await setDoc(doc(db(), PHOTOS, id), rest);
}

export async function deletePhoto(id: string): Promise<void> {
  await deleteDoc(doc(db(), PHOTOS, id));
}

/**
 * The one-time import of what is written in the source files.
 *
 * Runs only when both collections are empty, so it cannot overwrite the club's
 * own edits by being clicked twice. After it, Firestore is where the content
 * is edited and the arrays in `events.ts` and the gallery's `data.ts` are the
 * offline fallback — which is why they stay in the repo rather than being
 * deleted once this has run.
 *
 * Batched: 4 events and ~20 photographs go up as one write, so a dropped
 * connection halfway cannot leave the gallery referencing events that are not
 * there yet.
 */
export async function importSeedContent(
  seedEvents: readonly ForeseEvent[],
  seedAlbums: readonly GalleryAlbum[],
): Promise<{ events: number; photos: number }> {
  const batch = writeBatch(db());
  let photos = 0;

  for (const event of seedEvents) {
    const payload = Object.fromEntries(
      Object.entries(event).filter(([, value]) => value !== undefined && value !== ''),
    );
    batch.set(doc(db(), EVENTS, event.id), { ...payload, date: event.date ?? null });
  }

  for (const album of seedAlbums) {
    album.photos.forEach((photo, index) => {
      const id = photo.id || `${album.eventId}-${index + 1}`;
      batch.set(doc(db(), PHOTOS, id), {
        eventId: album.eventId,
        src: photo.src,
        width: photo.width,
        height: photo.height,
        alt: photo.alt ?? '',
        circulate: photo.circulate !== false,
        order: index,
        ...(album.pinned ? { pinned: true } : {}),
      });
      photos += 1;
    });
  }

  await batch.commit();
  return { events: seedEvents.length, photos };
}

/**
 * The longest edge a stored photograph is allowed to have.
 *
 * A gallery tile is at most ~800px wide on a large screen, and the lightbox
 * shows one picture at viewport size. 2000 is generous for both, and well
 * under what a phone produces: a modern camera roll photograph is 4000px and
 * 5-8MB, which is slow to upload on college wifi and nine-tenths wasted once
 * it arrives.
 */
const MAX_EDGE = 2000;

/** How hard the browser re-compresses a resized photograph. */
const QUALITY = 0.85;

export interface PreparedImage {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * A photograph, resized if it needs it, with the dimensions it will actually
 * have once stored.
 *
 * Both halves matter.
 *
 * **The size is measured, not asked for.** `GalleryPhoto` requires `width` and
 * `height` because they reserve the tile's box in the grid — without them
 * every image that loads reflows the page, which is the single biggest cause
 * of layout shift on a gallery. Reading them from the file is the only way the
 * club can post an album without measuring anything by hand.
 *
 * **And it is the size *after* any resize.** Measuring the original and
 * uploading a smaller file would write dimensions that do not match the
 * picture — the tile would be reserved at the wrong shape, which is the exact
 * bug the fields exist to prevent.
 *
 * A photograph already within the limit is uploaded untouched: re-encoding a
 * picture that does not need it only loses quality.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const longest = Math.max(width, height);

  if (longest <= MAX_EDGE) {
    bitmap.close();
    return { blob: file, width, height };
  }

  const scale = MAX_EDGE / longest;
  const target = { width: Math.round(width * scale), height: Math.round(height * scale) };

  const canvas = document.createElement('canvas');
  canvas.width = target.width;
  canvas.height = target.height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, target.width, target.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALITY),
  );
  // A browser that would not give us a blob is not a reason to lose the
  // photograph: upload the original, which is only ever bigger than needed.
  if (!blob) return { blob: file, width, height };

  return { blob, ...target };
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET as string | undefined;

export const uploadConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Put a photograph on the CDN and return its URL.
 *
 * Cloudinary rather than Firebase Storage: Storage has needed a billing
 * account on the project since February 2026, and asking a student club to
 * attach a card to host a few hundred photographs is the wrong trade. The
 * upload preset is unsigned, which would normally mean an open write endpoint
 * — but the gallery renders from Firestore rows, never from the bucket, and
 * only the club's account can write a row. A file nobody has a row for appears
 * nowhere on the site.
 *
 * `f_auto,q_auto` is applied at delivery, so the gallery serves WebP or AVIF
 * to browsers that take it without anything being converted by hand.
 */
export async function uploadImage(file: Blob, folder: string): Promise<string> {
  if (!uploadConfigured) throw new Error('Image uploads are not configured.');

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', UPLOAD_PRESET!);
  body.append('folder', `forese/${folder}`);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body,
  });
  if (!response.ok) throw new Error(`Upload failed (${response.status})`);

  const result = (await response.json()) as { secure_url: string };
  return result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
}
