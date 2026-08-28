import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from '@/components/motion/PageTransition';
import { findRoute } from '@/app/routes';
import { applyPageMeta } from '@/lib/seo';
import { SITE } from '@/data/site';

/**
 * The app shell wrapping every route.
 *
 * Owns the three things that must behave identically on every page and are
 * easy to forget page by page: the skip link, scroll position on navigation,
 * and document metadata.
 */
export function RootLayout() {
  const location = useLocation();
  const route = findRoute(location.pathname);

  // Reset scroll on navigation. Without this the new page inherits the old
  // page's scroll offset, which reads as a broken link.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Title and meta tags, driven by the route table.
  useEffect(() => {
    applyPageMeta(route?.title ?? 'Page not found', route?.description ?? SITE.description);
  }, [route]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="bg-primary text-primary-fg text-label sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60]"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
