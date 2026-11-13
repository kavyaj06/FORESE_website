import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { SiteLoader } from '@/components/motion/SiteLoader';
import { IntroContext } from '@/components/motion/IntroContext';
import { findRoute, resolveRouteMeta } from '@/app/routes';
import { applyPageMeta } from '@/lib/seo';
import { SITE } from '@/data/site';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * The app shell wrapping every route.
 *
 * Owns the two things that must behave identically on every page and are easy
 * to forget page by page: the skip link and document metadata. Scroll position
 * on navigation belongs to `PageTransition`, which mounts when the incoming
 * page does — see the note there.
 */
/**
 * The routes the brand orange reaches.
 *
 * Prefixes, so an album page and an event page inherit from their index
 * without being listed. See the scope block at the foot of `theme.css` for
 * what the attribute actually does.
 */
const BRAND_ROUTES = ['/gallery', '/events', '/team', '/tips'];

/**
 * Routes that take the colour but not the column rules.
 *
 * The team page is cards on a stage, and a ruled grid behind a fanned hand of
 * them read as two patterns arguing. The orange stays; this is only the lines.
 */
const UNRULED_ROUTES = ['/team'];

/** Once per tab. A curtain on every visit makes a site feel slower the more
    of it you look at. */
const seenIntro =
  typeof sessionStorage !== 'undefined' && sessionStorage.getItem('forese-intro') === '1';

export function RootLayout() {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [introDone, setIntroDone] = useState(seenIntro);
  const meta = resolveRouteMeta(location.pathname);

  /**
   * What counts as a different page, for the transition below.
   *
   * The route's pattern, not the address. `/tips/aptitude` and `/tips/resume`
   * are the same page showing a different guide: keyed by the address, every
   * click on the rail tore down the hero and the rail with it and faded the
   * whole thing back in from nothing, which read as a flash where it should
   * have read as a tab. Keyed by the pattern they are one mounted page, so
   * what changes is the guide, the rail's underline slides between topics
   * instead of blinking, and the same holds for one gallery album to the next.
   */
  const page = findRoute(location.pathname)?.route.path ?? location.pathname;

  /**
   * Back to the top on every navigation, and how it gets there.
   *
   * Scroll belongs to the address rather than to the page, now that the two
   * are not the same thing: switching guide has to land at the top even
   * though nothing remounted. A layout effect, so it happens before the
   * browser paints the new content at the old offset.
   *
   * **Instant between pages, smooth within one.** Arriving on a new page
   * part-way down is a bug, so that one is a cut. But a reader half-way down
   * a guide who clicks the next tab has not gone anywhere: the hero and the
   * rail are still in front of them, and snapping the ground out from under
   * a page that visibly stayed put reads as a glitch. Travelling there says
   * what happened.
   */
  const previous = useRef(page);
  useLayoutEffect(() => {
    const samePage = previous.current === page;
    previous.current = page;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: samePage && !prefersReducedMotion ? 'smooth' : 'instant',
    });
  }, [location.pathname, page, prefersReducedMotion]);

  // Title and meta tags, driven by the route table.
  useEffect(() => {
    applyPageMeta(meta.title ?? 'Page not found', meta.description ?? SITE.description);
  }, [meta.title, meta.description]);

  return (
    <IntroContext.Provider value={introDone}>
      {!seenIntro && (
        <SiteLoader
          onDone={() => {
            sessionStorage.setItem('forese-intro', '1');
            setIntroDone(true);
          }}
        />
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

        {/* The brand scope, set per route rather than per page component.
            Every page returns a fragment, so there is no element on them to
            carry the attribute without adding a wrapper div to each, and one
            list in one file is also the only place to look when asking which
            pages are coloured. Home and mock placements are absent on
            purpose: home is not to change, and mocks already carries the
            orange in its own scoped workflow palette.

            On `main`, so the navbar, the footer and the scroll progress bar
            stay monochrome. Chrome reading the same on every route is what
            stops the colour looking like a half finished repaint. */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1"
          data-accent={
            BRAND_ROUTES.some((prefix) => location.pathname.startsWith(prefix))
              ? 'brand'
              : undefined
          }
          data-rules={
            UNRULED_ROUTES.some((prefix) => location.pathname.startsWith(prefix))
              ? 'off'
              : undefined
          }
        >
          {/* No AnimatePresence. Keyed by pathname so React mounts a fresh
              PageTransition per route; see the note in that file for why the
              exit animation had to go. */}
          <PageTransition key={page}>
            <Outlet />
          </PageTransition>
        </main>

        <Footer />
      </div>
    </IntroContext.Provider>
  );
}
