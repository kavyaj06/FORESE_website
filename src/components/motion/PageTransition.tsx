import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT_BRAND } from './variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Wraps page content so a route change fades in rather than snapping.
 *
 * Rendered by RootLayout with the route's pattern as its key, so React
 * unmounts the old page and mounts a new instance of this when the reader
 * genuinely changes page — and not when they only change a parameter, which
 * is one guide of Placement Prep to the next, or one gallery album to the
 * next.
 *
 * **There is deliberately no exit animation, and no `AnimatePresence`.** The
 * previous version had both, and it white-screened every navigation in a
 * production build — reproducibly, on every route. The outgoing page ran its
 * exit, reached `opacity: 0`, and was never replaced: `main` held exactly one
 * child throughout, and because React Router had already swapped the content
 * inside that same wrapper, what was left was the *new* page faded to nothing.
 * The site looked blank while its markup was entirely present, which is why it
 * appeared as a white screen with a working header. Only production was
 * affected, so the dev server never showed it.
 *
 * The mechanism was `AnimatePresence` never firing exit-complete, so the swap
 * it gates never happened. Rather than tune that, this drops the gate: a page
 * that fades out is worth having, and a page that never arrives is not. On
 * mount the wrapper animates in and nothing anywhere waits on a callback for
 * content to become visible.
 *
 * Scroll used to be reset here, on mount. It moved to `RootLayout`, which
 * watches the address: this is keyed by the route's *pattern* now, so it no
 * longer mounts when only a parameter changes — and a reader switching from
 * one guide to the next still has to land at the top of it.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT_BRAND }}
    >
      {children}
    </motion.div>
  );
}
