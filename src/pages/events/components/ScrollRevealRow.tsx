import { useEffect, useRef, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useScroll, useTransform } from 'framer-motion';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface ScrollRevealRowProps {
  children: ReactNode;
  /** Position in the list. Drives the stagger when a whole list mounts at once. */
  index: number;
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

/** Seconds between rows when a list mounts, and the ceiling on the total. */
const STEP = 0.055;
const MAX_STAGGER = 0.28;
/** Holds the incoming cascade until the outgoing list's 0.16s fade has gone. */
const LEAD_IN = 0.16;
const MOUNT_DURATION = 0.42;

/** Travel, in px, contributed by each of the two reveals at their start. */
const SCROLL_RISE = 22;
const MOUNT_RISE = 18;

/**
 * A list row revealed by two things at once: where it is, and whether it has
 * just arrived.
 *
 * **Scroll** is the primary one, and it replaced a `whileInView` trigger. A
 * trigger fires at one moment and then plays on its own clock, so its timing
 * is only ever right at one scroll speed. Tuned to look settled during a slow
 * scroll, a fast flick outruns it and rows sit blank on screen while they
 * catch up; given enough lead to survive the flick, the lead must exceed the
 * height of the list and every row fires at once with no sequence left. No
 * constant satisfies both — that was the wrong mechanism, not a mistuned
 * value. Bound to the row's own position there is no clock to outrun: scroll
 * fast and rows are simply further along, scroll back and they play backwards,
 * stop halfway and a row holds halfway.
 *
 * **Mount** exists because scroll alone cannot answer a filter change. Rows
 * already on screen are at scroll progress 1 the instant they mount, so a new
 * list appeared fully formed — a blink that read as a rendering fault rather
 * than as a list being replaced. The mount value animates 0 to 1 with an
 * index stagger, which is the cascade.
 *
 * The two are multiplied rather than picked between, and that is the point:
 * a row that is off screen has scroll progress 0, so no amount of mount
 * progress reveals it. Switching to a filter with more rows than fit does not
 * "use up" the entrance of the rows below the fold — they still wait to be
 * scrolled to. Every combination stays consistent because neither reveal can
 * override the other.
 *
 * The cost is a `useScroll` per row rather than one for the list. Acceptable
 * at a page of five; it would not be at a hundred, and this should not be
 * reached for as a general-purpose list wrapper without revisiting that.
 *
 * Under reduced motion the row renders plain, with neither reveal attached.
 */
export function ScrollRevealRow({ children, index }: ScrollRevealRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: OFFSET });
  const mount = useMotionValue(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      mount.set(1);
      return;
    }
    const controls = animate(mount, 1, {
      duration: MOUNT_DURATION,
      ease: EASE_OUT_BRAND,
      delay: LEAD_IN + Math.min(index * STEP, MAX_STAGGER),
    });
    return () => controls.stop();
  }, [index, mount, prefersReducedMotion]);

  // Opacity reaches full at 0.55 of the scroll range so the row is solid a
  // little before it finishes travelling — it should arrive readable, not
  // still fading while it settles.
  const opacity = useTransform(
    [scrollYProgress, mount],
    ([scroll, m]: number[]) => Math.min(scroll / 0.55, 1) * m,
  );
  const y = useTransform(
    [scrollYProgress, mount],
    ([scroll, m]: number[]) => (1 - scroll) * SCROLL_RISE + (1 - m) * MOUNT_RISE,
  );
  const rotateX = useTransform(
    [scrollYProgress, mount],
    ([scroll, m]: number[]) => (1 - scroll) * -10 + (1 - m) * -8,
  );

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
