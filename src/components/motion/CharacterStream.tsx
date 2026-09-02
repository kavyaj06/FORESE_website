import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

interface CharacterStreamProps {
  /** One line each. Order is the order they are stacked. */
  lines: string[];
  className?: string;
}

/**
 * Where each line starts, in character columns.
 *
 * Fixed rather than random: the composition has to be the same every time it
 * loops, and a layout that reshuffles itself is a different picture on every
 * pass rather than one animation being replayed.
 */
const INDENTS = [0, 6, 3, 9];

/** Seconds. */
const STAGGER_IN = 0.028;
const DUR_IN = 0.62;
const HOLD = 1.4;
const STAGGER_OUT = 0.026;
const DUR_OUT = 0.52;

/** A monospace glyph's advance, as a fraction of its font size. */
const ADVANCE = 0.6;
/** Fraction of the box the widest line is allowed to occupy. */
const FILL = 0.86;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Deterministic pseudo-random in [0, 1) from an integer.
 *
 * The travel needs variation — characters arriving on precisely the same path
 * read as a machine feeding a slot — but `Math.random` would give a different
 * variation on every render and every loop, so the animation could never be
 * looked at twice or checked against itself. Hashing the character's own index
 * gives spread that never changes.
 */
function jitter(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

interface Slot {
  x: number;
  y: number;
  /** Position in the left-to-right stream, across every line at once. */
  order: number;
}

/**
 * Text assembled one character at a time, held, then dismantled in reverse.
 *
 * **The unit of animation is the character, not the word or the line.** Every
 * glyph is its own absolutely positioned element with its own place in a single
 * left-to-right stream that runs across all the lines at once, so characters
 * from different lines interleave while travelling and only resolve into
 * readable words as they land. Animating words would produce a different effect
 * entirely — four things sliding in — and animating the block would produce a
 * fifth.
 *
 * **Positions are measured, never hardcoded.** The font size is derived from
 * the box on every resize, and every character's destination is recomputed from
 * it, so the same composition holds at any width instead of drifting off the
 * edge at sizes nobody tested. Only the numbers are recomputed — the elements
 * are never re-laid-out, because movement is written as `translate3d` on a
 * transform that the compositor owns.
 *
 * **Monospace throughout, including the settled words.** The final grid is
 * built on a uniform advance, and swapping to a proportional face at the moment
 * a character lands would move it — the one thing "settle into their exact
 * final positions" rules out. It is also what the reference does: its finished
 * words sit in the same monospace stream the incoming characters come from.
 *
 * The loop is one clock, not a chain of timeouts. A timeline that is a pure
 * function of elapsed time cannot drift, can be paused and resumed by pausing
 * the clock, and produces the same frame at the same moment on every pass.
 */
export function CharacterStream({ lines, className }: CharacterStreamProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLSpanElement[]>([]);
  const slotsRef = useRef<Slot[]>([]);
  const widthRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Flattened once: the character list never changes, only where each one goes.
  const chars = lines.flatMap((line, row) =>
    [...line].map((ch, col) => ({ ch, row, col, key: `${row}-${col}` })),
  );

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      if (!width) return;
      widthRef.current = width;

      const cols = Math.max(...lines.map((line, i) => (INDENTS[i] ?? 0) + line.length));
      const fontSize = (width * FILL) / (cols * ADVANCE);
      const advance = fontSize * ADVANCE;
      const lineHeight = fontSize * 1.9;

      const blockW = cols * advance;
      const blockH = lines.length * lineHeight;
      const originX = (width - blockW) / 2;
      const originY = (height - blockH) / 2 + lineHeight * 0.25;

      // One stream across every line, ordered by where a character ends up
      // horizontally — which is what makes the arrival read as left-to-right
      // rather than as four lines each doing their own thing.
      const placed = chars.map((c) => ({
        x: originX + ((INDENTS[c.row] ?? 0) + c.col) * advance,
        y: originY + c.row * lineHeight,
        order: 0,
      }));
      placed
        .map((slot, i) => ({ i, x: slot.x, y: slot.y }))
        .sort((a, b) => a.x - b.x || a.y - b.y)
        .forEach((entry, rank) => {
          placed[entry.i].order = rank;
        });

      slotsRef.current = placed;
      nodesRef.current.forEach((node) => {
        if (node) node.style.fontSize = `${fontSize}px`;
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [chars, lines, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const count = chars.length;
    const inSpan = count * STAGGER_IN + DUR_IN;
    const outSpan = count * STAGGER_OUT + DUR_OUT;
    const cycle = inSpan + HOLD + outSpan;

    let frame = 0;
    let start = 0;
    let running = false;

    const paint = (now: number) => {
      if (!start) start = now;
      const t = ((now - start) / 1000) % cycle;
      const slots = slotsRef.current;
      const width = widthRef.current;

      for (let i = 0; i < count; i += 1) {
        const node = nodesRef.current[i];
        const slot = slots[i];
        if (!node || !slot) continue;

        const drift = jitter(i);
        let x = slot.x;
        let y = slot.y;
        let opacity = 1;

        if (t < inSpan) {
          // Arriving. Each character starts off the left edge, further out the
          // more it is jittered, and eases into place.
          const p = clamp01((t - slot.order * STAGGER_IN) / DUR_IN);
          const e = easeOut(p);
          const from = -width * (0.3 + drift * 0.35);
          x = from + (slot.x - from) * e;
          y = slot.y + (drift - 0.5) * 26 * (1 - e);
          opacity = clamp01(p * 3);
        } else if (t > inSpan + HOLD) {
          // Leaving, rightmost first, travelling off the right edge — the same
          // stream played backwards rather than a fade.
          const rank = count - 1 - slot.order;
          const p = clamp01((t - inSpan - HOLD - rank * STAGGER_OUT) / DUR_OUT);
          const e = easeInOut(p);
          const to = width * (1.25 + drift * 0.3);
          x = slot.x + (to - slot.x) * e;
          y = slot.y + (drift - 0.5) * 22 * e;
          opacity = clamp01(1 - p * 1.4);
        }

        node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        node.style.opacity = String(opacity);
      }

      frame = requestAnimationFrame(paint);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          start = 0;
          frame = requestAnimationFrame(paint);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(frame);
        }
      },
      { threshold: 0 },
    );
    observer.observe(wrap);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [chars, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={cn('flex flex-col justify-center font-mono', className)}>
        {lines.map((line, i) => (
          <p key={i} style={{ paddingLeft: `${(INDENTS[i] ?? 0) * 0.6}em` }}>
            {line}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={cn('relative overflow-hidden', className)}>
      {/* The lines as real text for anything that reads rather than looks. The
          animated glyphs are one element per character and would be announced
          as a stream of letters. */}
      <span className="sr-only">{lines.join('. ')}</span>

      {chars.map((c, i) => (
        <span
          key={c.key}
          aria-hidden="true"
          ref={(node) => {
            if (node) nodesRef.current[i] = node;
          }}
          className="absolute top-0 left-0 font-mono leading-none whitespace-pre will-change-transform"
          style={{ opacity: 0 }}
        >
          {c.ch}
        </span>
      ))}
    </div>
  );
}
