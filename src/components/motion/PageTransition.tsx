import { useLayoutEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from './variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Wraps page content so route changes cross-fade rather than snapping.
 *
 * Rendered by RootLayout with the pathname as its key, inside an
 * <AnimatePresence mode="wait"> so the outgoing page finishes before the
 * incoming one starts.
 *
 * It also owns resetting scroll to the top, and owns it *because* of that
 * `mode="wait"`. Resetting on a pathname change — the obvious place, and where
 * this used to live — runs the moment the URL changes, which is a couple of
 * hundred milliseconds before the incoming page mounts: the outgoing page is
 * still on screen, the document is still its height, and the scroll position
 * set then does not survive the swap. Keyed by pathname, this component mounts
 * exactly when the new page does, so the reset lands after it.
 *
 * `useLayoutEffect` rather than `useEffect` so it happens before the browser
 * paints; on an effect the reader sees one frame of the new page at the old
 * page's scroll offset.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}
