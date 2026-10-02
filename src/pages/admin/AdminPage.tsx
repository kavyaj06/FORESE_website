import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Container } from '@/components/layout/Container';
import { Button, Card } from '@/components/ui';
import { EVENTS } from '@/data/events';
import { GALLERY_ALBUMS } from '@/pages/gallery/data';
import { firebaseConfigured } from '@/data/remote';
import { ADMIN_EMAIL, firebaseAuth, signInWithGoogle, signOutOfGoogle } from '@/lib/firebase';
import { EventsEditor } from './EventsEditor';
import { GalleryUploader } from './GalleryUploader';
import { importSeedContent, listEvents, listPhotos } from './api';
import { Notice } from './ui';

/**
 * The club's own editing screen.
 *
 * Reached from the copyright line in the footer, and from nowhere else — it is
 * not in the navigation, not in the sitemap and marked `noindex`. That is
 * obscurity, not security, and the difference matters:
 *
 * **Nothing on this page stops anyone doing anything.** The email check below
 * exists so a wrong sign-in says so plainly instead of failing later with a
 * permission error. What actually stops a stranger writing is `firestore.rules`
 * in the repo root, which compares the signed-in account's email against the
 * club's. A page can be edited in a browser; a rule cannot.
 *
 * The practical consequence is worth stating: whoever can sign into the club's
 * Google account can change this site. That is the whole of the access model.
 */
export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'events' | 'gallery'>('events');

  useEffect(() => {
    // The page is noindex in the markup too; this is the belt to that's braces,
    // and it is removed when the component unmounts so no other page inherits it.
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!firebaseConfigured) {
      setChecking(false);
      return;
    }
    return onAuthStateChanged(firebaseAuth(), (next) => {
      setUser(next);
      setChecking(false);
    });
  }, []);

  async function signIn() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (cause) {
      const message = (cause as Error).message;
      // A popup the reader closed themselves is not an error worth shouting
      // about; everything else is.
      if (!message.includes('popup-closed-by-user')) setError(message);
    }
  }

  if (!firebaseConfigured) {
    return (
      <Shell>
        <Notice tone="error">
          This site has no Firebase project configured yet, so there is nothing to sign in to. The
          setup is four environment variables and a page of rules — see{' '}
          <code>docs/admin-setup.md</code>.
        </Notice>
      </Shell>
    );
  }

  if (checking) {
    return (
      <Shell>
        <p className="text-small text-text-muted">Checking…</p>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <Card padding="lg" className="gap-md flex flex-col items-start">
          <p className="text-body text-text-muted max-w-[46ch]">
            Sign in with the club's Google account to add events and post photographs. Changes go
            live immediately — there is no deploy to wait for.
          </p>
          {error && <Notice tone="error">{error}</Notice>}
          <Button onClick={signIn}>Sign in with Google</Button>
        </Card>
      </Shell>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <Shell>
        <Card padding="lg" className="gap-md flex flex-col items-start">
          <Notice tone="error">
            {user.email} cannot edit this site. Only {ADMIN_EMAIL} can.
          </Notice>
          <Button variant="secondary" onClick={() => void signOutOfGoogle()}>
            Sign out
          </Button>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="gap-lg flex flex-col">
        <div className="gap-md flex flex-wrap items-center justify-between">
          <div className="gap-xs flex">
            <TabButton active={tab === 'events'} onClick={() => setTab('events')}>
              Events
            </TabButton>
            <TabButton active={tab === 'gallery'} onClick={() => setTab('gallery')}>
              Gallery
            </TabButton>
          </div>
          <div className="gap-sm flex items-center">
            <span className="text-caption text-text-muted">{user.email}</span>
            <Button size="sm" variant="ghost" onClick={() => void signOutOfGoogle()}>
              Sign out
            </Button>
          </div>
        </div>

        <SeedImport />

        {tab === 'events' ? <EventsEditor /> : <GalleryUploader />}
      </div>
    </Shell>
  );
}

/**
 * The one-time move of the content that is written in the source files.
 *
 * Offered only while both collections are empty, so it cannot overwrite
 * anything the club has since edited. After it runs, Firestore is where the
 * content lives and the arrays in the source are the offline fallback.
 */
function SeedImport() {
  const [needed, setNeeded] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([listEvents(), listPhotos()])
      .then(([events, photos]) => setNeeded(events.length === 0 && photos.length === 0))
      .catch(() => setNeeded(false));
  }, [done]);

  if (!needed) return done ? <Notice tone="success">{done}</Notice> : null;

  return (
    <Card padding="md" className="gap-sm flex flex-col items-start">
      <p className="text-small text-text-muted max-w-[60ch]">
        Nothing has been published yet, so the site is showing the {EVENTS.length} events and{' '}
        {GALLERY_ALBUMS.length} albums built into it. Import them once and they become editable
        here.
      </p>
      <Button
        size="sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const result = await importSeedContent(EVENTS, GALLERY_ALBUMS);
            setDone(`Imported ${result.events} events and ${result.photos} photographs.`);
          } catch (cause) {
            setDone((cause as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? 'Importing…' : 'Import what is on the site'}
      </Button>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`text-label duration-fast ease-out-brand rounded-md px-4 py-2 transition-colors ${
        active ? 'bg-primary text-primary-fg' : 'text-text-muted hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-section">
      <Container className="max-w-content-narrow">
        <h1 className="text-h2">Club editor</h1>
        <p className="text-small text-text-muted mt-xs mb-xl">
          Events and photographs for forese-website.vercel.app
        </p>
        {children}
      </Container>
    </section>
  );
}
