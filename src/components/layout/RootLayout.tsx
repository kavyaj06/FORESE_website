import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { SiteLoader } from '@/components/motion/SiteLoader';
import { IntroContext } from '@/components/motion/IntroContext';
import { resolveRouteMeta } from '@/app/routes';
import { applyPageMeta } from '@/lib/seo';
import { SITE } from '@/data/site';

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
  const [introDone, setIntroDone] = useState(seenIntro);
  const meta = resolveRouteMeta(location.pathname);

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
