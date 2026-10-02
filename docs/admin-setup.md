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
   *This is the only thing standing between the site and a stranger. If the
   club's address ever changes, it changes here first.*
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

## If something goes wrong

| what you see | what it means |
|---|---|
| "cannot edit this site" after signing in | Signed in as the wrong Google account. |
| `Missing or insufficient permissions` when saving | The rules were not published, or the address in them differs from the account. |
| The site shows old events after an edit | The read timed out and it fell back to the built-in content. Reload. |
| `/admin` says it is not configured | The four `VITE_FIREBASE_*` values are missing from this environment. |
