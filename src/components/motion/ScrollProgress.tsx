import { motion, useScroll, useSpring } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Reading-progress bar pinned to the top of the viewport.
 *
 * Earns its place on a site of long scrolling pages: it answers "how much of
 * this is left" without the visitor having to reach for the scrollbar. Not
 * decoration — it is bound to scroll position, so it only ever moves when the
 * page does.
 */
export function ScrollProgress() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: prefersReducedMotion ? scrollYProgress : smoothed }}
      className="bg-accent fixed inset-x-0 top-0 z-[60] h-0.5 origin-left"
    />
  );
}
