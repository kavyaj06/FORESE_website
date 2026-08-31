import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface ScrollRevealRowProps {
  children: ReactNode;
}

/**
 * Where the row's own reveal starts and finishes, as `useScroll` offsets.
 *
 * Read as "the row's top edge, against the viewport": it begins at 1.08 —
 * just below the fold, still out of sight — and is complete at 0.86, a little
 * after it has crossed into view. So the row does most of its arriving off
 * screen and lands settled, but not so early that nothing is left to see.
 */
const OFFSET = ['start 1.08', 'start 0.86'] as ['start 1.08', 'start 0.86'];

/**
 * A list row that reveals itself continuously against scroll position.
 *
 * This replaced a `whileInView` trigger, and the reason is worth keeping. A
 * trigger fires at one moment and then plays on its own clock, so its timing
 * is only ever right at one scroll speed. Tuned to look settled during a slow
 * scroll, a fast flick outruns it and rows sit blank on screen while they
 * catch up; given enough lead time to survive the flick, the lead has to be
 * longer than the list itself and every row fires at once with no sequence
 * left. There is no value that satisfies both, which is what "one is late,
 * one is early" was — not a mistuned constant but the wrong mechanism.
 *
 * Binding the reveal to the row's own position removes the clock entirely.
 * There is nothing to outrun: scroll fast and the rows are simply further
 * along, scroll back and they play backwards, stop halfway and the row holds
 * halfway. Each row runs its own `useScroll` against its own element, so the
 * sequence down the list comes from where the rows are rather than from an
 * index delay — which is also what made one row look late relative to its
 * neighbour.
 *
 * The cost is a `useScroll` per row rather than one for the list. That is
 * acceptable at a page of five; it would not be at a hundred, and this should
 * not be reached for as a general-purpose list wrapper without revisiting it.
 *
 * Under reduced motion the row renders plain, with no scroll binding at all.
 */
export function ScrollRevealRow({ children }: ScrollRevealRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: OFFSET });

  const opacity = useTransform(scrollYProgress, [0, 0.55], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [-10, 0]);

  if (prefersReducedMotion) {
    return <div ref={ref}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, rotateX, transformPerspective: 1200 }}
      className="[transform-origin:50%_100%]"
    >
      {children}
    </motion.div>
  );
}
