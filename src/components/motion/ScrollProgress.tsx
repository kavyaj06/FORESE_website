import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Reading-progress bar pinned to the top of the viewport.
 *
 * Earns its place on a site of long scrolling pages: it answers "how much of
 * this is left" without the visitor having to reach for the scrollbar. Not
 * decoration — it is bound to scroll position, so it only ever moves when the
 * page does.
 *
 * It is also the brand's own bar, and the one place on the site where the
 * whole ramp is shown doing something rather than sitting there: the gradient
 * is fixed to the viewport's width, so the rail uncovers it left to right and
 * the colour it has reached *is* how far through the page you are — crimson at
 * the top, mist at the end.
 *
 * Width rather than `scaleX`, which is the usual way to build this and would
 * be wrong here: scaling squeezes the whole ramp into whatever width the bar
 * currently has, so every pixel of it changes hue on every scroll event and
 * the bar shimmers. Animating width on a fixed, 2px, single-child element
 * costs nothing measurable.
 */
export function ScrollProgress() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  const width = useTransform(
    prefersReducedMotion ? scrollYProgress : smoothed,
    (value) => `${Math.max(0, Math.min(1, value)) * 100}%`,
  );

  return (
    <motion.div
      aria-hidden="true"
      style={{ width }}
      className="bg-brand-rail fixed top-0 left-0 z-[60] h-0.5"
    />
  );
}
