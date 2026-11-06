# Setting up the club editor

Twenty minutes, two free accounts, no card. Until this is done the site works
exactly as before and `/admin` says it is not configured.

## 1. Firebase (sign-in and content)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add
   project** → call it `forese-website`. Google Analytics: off.
2. **Build → Authentication → Get started → Google → Enable.** Set the support
   email to the club address. Save.
3. **Authentication → Settings → Authorized domains** → add
   `forese-website.vercel.app`. (`localhost` is already there.)
4. **Build → Firestore Database → Create database → Production mode.** Pick a
   region close by: `asia-south1` (Mumbai).
5. **Firestore → Rules** → replace everything with the contents of
   [`firestore.rules`](../firestore.rules) → **Publish**.
   _This is the only thing standing between the site and a stranger. If the
   club's address ever changes, it changes here first._
6. **Project settings → General → Your apps → Web (`</>`)** → register the app.
   Copy `apiKey`, `authDomain`, `projectId` and `appId` out of the snippet it
   shows.

## 2. Cloudinary (photographs)

Firebase Storage would be the obvious home for these, but it has needed a
billing account on the project since February 2026. Cloudinary's free tier
needs no card and serves resized images from a CDN, which the gallery wants
anyway.

1. [cloudinary.com](https://cloudinary.com) → free account. Note the **cloud
   name** on the dashboard.
2. **Settings → Upload → Upload presets → Add upload preset.**
   - Signing mode: **Unsigned**
   - Folder: `forese`
   - Allowed formats: `jpg, png, webp`
   - Max file size: `10 MB`
3. Note the preset's name.

Unsigned means the preset is a public upload endpoint, which is normally a
problem. It is not one here: **the gallery renders from Firestore rows, never
from the Cloudinary folder**, and only the club's account can write a row. A
file nobody has a row for appears nowhere on the site.

## 3. The environment

Copy `.env.example` to `.env.local` and fill in the six values. Then put the
same six into **Vercel → the project → Settings → Environment Variables** (all
three environments) and redeploy.

None of them is a secret — a Firebase web key identifies a project rather than
authorising anything, and the Cloudinary preset is public by design. The rules
are what protect the data.

## 4. First run

1. Open the site → footer → click **FORESE** in the copyright line.
2. Sign in with the club's Google account. Any other account is refused.
3. The page offers to **import what is on the site** — the events and albums
   currently written in the source. Click it once. From then on Firestore is
   where they are edited.
4. Add an event, reload the public site: it is there, with no deploy.

## How it fits together

```
visitor          →  one REST read  →  Firestore  ←  write  ←  admin page (signed in)
                                          ↑                        │
site falls back to the content                                     └→ Cloudinary (photographs)
in src/data/events.ts if this
read fails or times out (2s)
```

The content in `src/data/events.ts` and `src/pages/gallery/data.ts` stays in
the repo on purpose: it is what the site shows when Firestore cannot be
reached, and it is what the import in step 4 reads.

## 5. The resume drop box

At the foot of the resume guide, on `/tips/resume`, a student can send the club
a PDF. They appear under **Resumes** in the editor, beside Events and Gallery.

There is nothing to set up and nothing to pay for. The files go into Firestore
itself, in two collections — `resume_uploads` holds the name, size and arrival
time, `resume_files` holds the bytes — so the inbox can list fifty submissions
without downloading fifty PDFs.

**One step is required: republish the rules.** The drop box writes to two
collections the old rules deny, so until `firestore.rules` is pasted into the
console again, every submission comes back refused and the page tells the
student the box is not open yet.

Worth knowing:

- **1MB per file**, because that is where a Firestore document stops. A one
  page resume is 50KB to 300KB. A bigger one is refused in the browser with a
  line saying what to do about it.
- **Only the club can read one.** A student can write a submission and can do
  nothing else: not read one, not list them, not change or delete one. Nothing
  in the editor produces a link that works outside the signed-in browser that
  asked for it, which is why these are in the database rather than on the CDN
  the photographs use.
- **No reply is possible.** The form asks for no email address, by the club's
  own decision. The student's own details are inside the PDF.
- **Deleting is the club's job.** Nothing expires on its own.
- **Anyone can send one.** It is a public form with no sign-in, so it can be
  scripted. There is no bill to run up on the free plan, but a flood would
  burn the day's write quota. If that ever happens, Firebase App Check is the
  fix.

## If something goes wrong

| what you see                                      | what it means                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| "cannot edit this site" after signing in          | Signed in as the wrong Google account.                                            |
| `Missing or insufficient permissions` when saving | The rules were not published, or the address in them differs from the account.    |
| The site shows old events after an edit           | The read timed out and it fell back to the built-in content. Reload.              |
| `/admin` says it is not configured                | The four `VITE_FIREBASE_*` values are missing from this environment.              |
| A student is told the drop box is not open        | The rules have not been republished since the drop box was added.                 |
| A resume lists but will not download              | Its `resume_files` document is gone. Delete the row; the file is not recoverable. |
