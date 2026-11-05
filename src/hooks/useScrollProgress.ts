import { useEffect } from 'react';
import { useMotionValue, type MotionValue } from 'framer-motion';

/**
 * How far down the document the reader has scrolled, from 0 to 1.
 *
 * framer-motion's own `useScroll()` is correct on a page that has stopped
 * changing size, and was measured here as exact to three decimal places at
 * 1440 and 390. What it does not do is notice the document getting *taller
 * underneath a reader who is not moving*. Parked halfway down a settled
 * guide and then given 3,000px of new content, `useScroll()` went on
 * reporting 0.5 when the true position was 0.3 — off by a fifth of the page,
 * and it stays off until something resizes the window.
 *
 * That case is not hypothetical on this site: every photograph is deferred
 * with `loading="lazy"`, so a guide grows by the height of its own picture
 * while the reader is already reading it. A progress line that silently
 * misreports by that much is worse than no progress line, because the reader
 * has no reason to distrust it.
 *
 * So this reads `scrollHeight` on every update instead of caching it, and
 * watches for height changes with a `ResizeObserver` rather than waiting for
 * a window resize that may never come.
 *
 * It returns a `MotionValue`, not state. Scroll handlers that call `setState`
 * re-render the tree on every frame, which is the documented way to make a
 * page feel worse for having been instrumented; a `MotionValue` written with
 * `.set()` drives a transform without React re-rendering at all. The handler
 * is also coalesced onto a single animation frame, so a burst of scroll
 * events does one measurement rather than a dozen.
 */
export function useScrollProgress(): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      // Guard the divide: a page shorter than the viewport has no scrollable
      // distance, and 0/0 would put NaN into a transform.
      const scrollable = doc.scrollHeight - window.innerHeight;
      progress.set(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    // The height changes without a scroll or a resize whenever a deferred
    // image lands or a section reflows, and the progress has to follow it.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [progress]);

  return progress;
}
