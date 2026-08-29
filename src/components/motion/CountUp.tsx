import { useEffect, useRef } from 'react';
import { animate, useInView } from 'framer-motion';
import { EASE_OUT_BRAND } from './variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

interface CountUpProps {
  /**
   * The final value exactly as it should read, e.g. `500+`, `40+`, `12 years`.
   * Any text around the number is preserved and only the digits are counted.
   */
  value: string;
  /** Seconds. Long enough to register, short enough not to be waited on. */
  duration?: number;
  className?: string;
}

/** Splits `"500+"` into `["", 500, "+"]`. Returns null when there is no number. */
function parse(value: string): { prefix: string; target: number; suffix: string } | null {
  const match = value.match(/^(\D*)([\d,]*\d)(.*)$/s);
  if (!match) return null;

  const target = Number(match[2].replace(/,/g, ''));
  if (!Number.isFinite(target)) return null;

  return { prefix: match[1], target, suffix: match[3] };
}

/**
 * A number that counts up to its value the first time it is seen.
 *
 * Three things this gets right that a naive counter does not:
 *
 *  - It writes to the DOM node directly instead of through React state. A
 *    counter that calls `setState` on every frame re-renders sixty times a
 *    second for as long as it runs, and a page can have several of them.
 *  - The final value is rendered invisibly underneath to reserve the width.
 *    Counting 0 → 500 changes the digit count twice, and without a reserved
 *    box everything beneath the number jumps as it grows.
 *  - The animated digits are hidden from assistive tech and the finished
 *    value is exposed once as text. A number changing sixty times a second
 *    is noise to a screen reader, not information.
 *
 * Counts once, on first sight — it is a flourish for arriving at the section,
 * not something to replay every time the visitor scrolls back past it.
 */
export function CountUp({ value, duration = 1.6, className }: CountUpProps) {
  const parsed = parse(value);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.5 });
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!parsed || !inView || prefersReducedMotion) return;
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, parsed.target, {
      duration,
      ease: EASE_OUT_BRAND,
      onUpdate: (latest) => {
        node.textContent = `${parsed.prefix}${Math.round(latest).toLocaleString('en-IN')}${parsed.suffix}`;
      },
    });

    return () => controls.stop();
  }, [inView, parsed?.target, parsed?.prefix, parsed?.suffix, duration, prefersReducedMotion]);

  // Nothing countable, or motion is unwanted — render the value as written.
  if (!parsed || prefersReducedMotion) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span ref={wrapRef} className={cn('grid tabular-nums', className)}>
      {/* Reserves the finished width. Without it the label below shifts each
          time the number gains a digit. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {value}
      </span>
      <span ref={nodeRef} aria-hidden="true" className="col-start-1 row-start-1">
        {parsed.prefix}0{parsed.suffix}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
