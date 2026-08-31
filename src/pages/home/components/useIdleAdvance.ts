import { useEffect, useRef, useState } from 'react';

interface IdleAdvanceOptions {
  /** Element that must be on screen for the cycle to run. */
  ref: React.RefObject<HTMLElement | null>;
  /** Off entirely when false — reduced motion, or a layout without the columns. */
  enabled: boolean;
  /** How long the page must be still before cycling begins. */
  idleMs?: number;
  /** How long each set of photographs is held. */
  intervalMs?: number;
}

/**
 * A step counter that advances only while the page is still and the element is
 * on screen.
 *
 * The two conditions are the whole point. Cycling photographs *during* a scroll
 * would put two unrelated motions on the same pixels — the columns are already
 * sliding in from the edges — and each would make the other harder to read. And
 * a carousel that keeps running after it leaves the viewport is work nobody is
 * watching, on a page that is otherwise careful about that.
 *
 * So: any scroll cancels the cycle and restarts an idle timer. When the page has
 * been still for `idleMs` and the element is in view, the cycle starts. Leaving
 * the viewport stops it. This is why it is a hook and not a `setInterval` in the
 * section — the bookkeeping for "still, and being looked at" is the substance of
 * it, and the section only wants the number.
 */
export function useIdleAdvance({
  ref,
  enabled,
  idleMs = 900,
  intervalMs = 3400,
}: IdleAdvanceOptions): number {
  const [step, setStep] = useState(0);
  const timerRef = useRef<number>(0);
  const idleRef = useRef<number>(0);
  const inViewRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    if (!element) return;

    const stopCycle = () => {
      window.clearInterval(timerRef.current);
      timerRef.current = 0;
    };

    const startCycle = () => {
      if (timerRef.current || !inViewRef.current) return;
      timerRef.current = window.setInterval(() => setStep((n) => n + 1), intervalMs);
    };

    const settle = () => {
      window.clearTimeout(idleRef.current);
      idleRef.current = window.setTimeout(startCycle, idleMs);
    };

    const onScroll = () => {
      stopCycle();
      settle();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) settle();
        else {
          stopCycle();
          window.clearTimeout(idleRef.current);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element);

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      stopCycle();
      window.clearTimeout(idleRef.current);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [ref, enabled, idleMs, intervalMs]);

  return step;
}
