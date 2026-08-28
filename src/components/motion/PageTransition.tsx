import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from './variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Wraps page content so route changes cross-fade rather than snapping.
 *
 * Rendered by RootLayout with the pathname as its key, inside an
 * <AnimatePresence mode="wait"> so the outgoing page finishes before the
 * incoming one starts.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}
