import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { IntroContext } from '@/components/motion/IntroContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { resolveRouteMeta } from '@/app/routes';
import { applyPageMeta } from '@/lib/seo';
import { SITE } from '@/data/site';

/**
 * The WebGL title sequence, split out of the main bundle.
 *
 * `three` and `gsap` together are larger than everything else the site ships,
 * and they are needed by one component that most visits never render — the
 * intro runs once per tab. Lazy means the bytes are fetched only when it is
 * actually going to play, and never at all for a reader who has seen it or
 * who asked for reduced motion.
 *
 * No `Suspense` fallback: a spinner in front of a title sequence is the exact
 * thing the sequence exists instead of. Until the chunk lands there is simply
 * nothing, and the page underneath is already rendered.
 */
const CinematicIntro = lazy(() => import('@/components/motion/CinematicIntro'));

/**
 * The app shell wrapping every route.
 *
 * Owns the two things that must behave identically on every page and are easy
 * to forget page by page: the skip link and document metadata. Scroll position
 * on navigation belongs to `PageTransition`, which mounts when the incoming
 * page does — see the note there.
 */
/** Once per tab. A curtain on every visit makes a site feel slower the more
    of it you look at. */
const seenIntro =
  typeof sessionStorage !== 'undefined' && sessionStorage.getItem('forese-intro') === '1';

export function RootLayout() {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [introDone, setIntroDone] = useState(seenIntro);

  const endIntro = () => {
    sessionStorage.setItem('forese-intro', '1');
    setIntroDone(true);
  };
  const meta = resolveRouteMeta(location.pathname);

  // Title and meta tags, driven by the route table.
  useEffect(() => {
    applyPageMeta(meta.title ?? 'Page not found', meta.description ?? SITE.description);
  }, [meta.title, meta.description]);

  return (
    <IntroContext.Provider value={introDone}>
      {/* Gated on `introDone`, not on the `seenIntro` constant it starts
          from. That constant is read once at module load and never changes,
          so keying the mount off it left the finished intro sitting over the
          site forever — the loader this replaced hid itself from the inside,
          which is why the old condition worked.

          Reduced motion skips it outright rather than playing a shorter
          version: a four-second full-screen animation is the thing that
          setting is asking not to happen, and the site behind it is complete
          without it. */}
      {!introDone && !prefersReducedMotion && (
        <Suspense fallback={null}>
          <CinematicIntro onDone={endIntro} />
        </Suspense>
      )}

      <div className="flex min-h-screen flex-col">
        <ScrollProgress />

        <a
          href="#main-content"
          className="bg-primary text-primary-fg text-label sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60]"
        >
          Skip to main content
        </a>

        <Navbar />

        <main id="main-content" tabIndex={-1} className="flex-1">
          {/* No AnimatePresence. Keyed by pathname so React mounts a fresh
              PageTransition per route; see the note in that file for why the
              exit animation had to go. */}
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>

        <Footer />
      </div>
    </IntroContext.Provider>
  );
}
