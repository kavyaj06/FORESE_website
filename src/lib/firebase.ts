import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore/lite';

/**
 * Firebase, for the admin page only.
 *
 * Nothing on the public site imports this file. The site reads its content
 * over plain REST (`@/data/remote`), which costs nothing in the bundle; the
 * SDK is here because *writing* needs a signed-in user, and signing in with
 * Google needs the auth library. The admin route is lazy, so this never
 * reaches a visitor who does not open it.
 *
 * `firestore/lite` rather than the full client: the admin page reads and
 * writes documents and has no use for realtime listeners or offline
 * persistence, which are most of the weight of the full build.
 *
 * **The config below is not a secret.** Firebase API keys identify a project;
 * they do not authorise anything. What stops a stranger writing is the
 * security rules — `firestore.rules` in the repo root — which check the signed
 * in account's email. If those rules are wrong, nothing in this file helps.
 */

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

/**
 * The one account allowed to edit the site.
 *
 * Also written into the security rules, which are the enforcement. This copy
 * exists so the page can say *why* a sign-in was refused instead of failing
 * later with a permission error nobody can read.
 */
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string) || 'forese@svce.ac.in';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function ensureApp(): FirebaseApp {
  if (!app) app = initializeApp(config);
  return app;
}

export function firebaseAuth(): Auth {
  if (!auth) auth = getAuth(ensureApp());
  return auth;
}

export function firestore(): Firestore {
  if (!db) db = getFirestore(ensureApp());
  return db;
}

/**
 * Sign in with Google, nudged towards the club's own domain.
 *
 * `login_hint` pre-fills the account chooser and `prompt: 'select_account'`
 * stops Google silently reusing whichever account the browser happens to be
 * signed into — on a shared club laptop that is the difference between
 * signing in as the club and signing in as whoever used it last.
 */
export async function signInWithGoogle(): Promise<string | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ login_hint: ADMIN_EMAIL, prompt: 'select_account' });
  const credential = await signInWithPopup(firebaseAuth(), provider);
  return credential.user.email;
}

export async function signOutOfGoogle(): Promise<void> {
  await signOut(firebaseAuth());
}
