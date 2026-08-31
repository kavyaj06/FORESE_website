import { useLayoutEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT_BRAND } from './variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Wraps page content so a route change fades in rather than snapping.
 *
 * Rendered by RootLayout with the pathname as its key, so React unmounts the
 * old page and mounts a new instance of this on every navigation.
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
 * It also owns resetting scroll to the top, in a layout effect so it lands
 * before the browser paints — on a plain effect the reader gets one frame of
 * the new page at the old page's scroll offset.
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT_BRAND }}
    >
      {children}
    </motion.div>
  );
}
