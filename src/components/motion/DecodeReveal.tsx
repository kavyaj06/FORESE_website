import { useEffect, useRef } from 'react';
import { useScroll } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

interface DecodeRevealProps {
  src?: string;
  alt?: string;
  /** Words that surface out of the noise. Kept short: they have to fit a row. */
  words: string[];
  className?: string;
}

/** The character field's shape. Monospace, so a grid of them is a real grid. */
const ROWS = 13;
const COLS = 42;
const GLYPHS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * How much of the field is still noise at a given progress.
 *
 * Every cell is given a fixed threshold once, and clears when progress passes
 * it. Deciding per frame whether a cell should clear would make the field
 * shimmer at random forever instead of resolving; a fixed threshold per cell
 * means the picture uncovers the same way every time and scrubs backwards
 * cleanly when the reader scrolls up.
 */
function thresholds(): number[][] {
  const out: number[][] = [];
  for (let r = 0; r < ROWS; r += 1) {
    const row: number[] = [];
    for (let c = 0; c < COLS; c += 1) {
      // Weighted so the field clears from the edges inward: the middle is the
      // part of a photograph you want last, because it is the part you are
      // waiting for.
      const dx = Math.abs(c / (COLS - 1) - 0.5) * 2;
      const dy = Math.abs(r / (ROWS - 1) - 0.5) * 2;
      const edge = Math.max(dx, dy);
      row.push(Math.min(0.95, (1 - edge) * 0.75 + Math.random() * 0.35));
    }
    out.push(row);
  }
  return out;
}

/**
 * A photograph that is uncovered by a field of characters resolving off it.
 *
 * The picture is behind a grid of monospace noise. As the section is scrolled,
 * cells clear — outside in — and a handful of real words settle out of the
 * noise before it goes, so the effect reads as something being decoded rather
 * than as an image simply fading up.
 *
 * **It is tied to scroll rather than to a timer.** A timed version plays once,
 * usually before the reader has arrived, and cannot be looked at twice. Bound
 * to position, the reader uncovers the picture themselves and can scrub it
 * back and forth, which is the whole appeal of the effect.
 *
 * The loop writes text into one `<pre>` through a ref and never through state:
 * this repaints roughly every 60ms and a `setState` at that rate would
 * re-render the section around it for no reason.
 *
 * Under `prefers-reduced-motion` there is no field at all — just the
 * photograph. A screen reader gets the image's `alt`; the noise is decorative
 * and hidden, since reading out four hundred random letters is not a
 * description of anything.
 */
export function DecodeReveal({ src, alt = '', words, className }: DecodeRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start 0.9', 'end 0.35'],
  });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const pre = preRef.current;
    const img = imgRef.current;
    const scrim = scrimRef.current;
    if (!pre) return;

    const grid = thresholds();

    // The words are laid into fixed rows so they surface in the same places
    // every time, and are the last thing to go.
    const placed = words.map((word, i) => ({
      word,
      row: 1 + Math.floor((i * (ROWS - 3)) / Math.max(words.length, 1)),
      col: 3 + ((i * 13) % Math.max(COLS - word.length - 4, 1)),
    }));

    // The field has to fill the picture, so the type is sized from the box
    // rather than set in the stylesheet. A monospace glyph is about 0.6em
    // wide, so COLS of them fit a width of `COLS * 0.6 * fontSize`; solving
    // for the font size is the only way the grid stays edge to edge at every
    // breakpoint. Fixed type left the noise as a small patch in the middle.
    const fit = () => {
      const width = wrapRef.current?.clientWidth ?? 0;
      if (width) pre.style.fontSize = `${(width * 0.92) / (COLS * 0.6)}px`;
    };
    fit();
    const resize = new ResizeObserver(fit);
    if (wrapRef.current) resize.observe(wrapRef.current);

    let frame = 0;
    let last = 0;
    let running = false;

    const paint = (now: number) => {
      // ~16 repaints a second. Faster looks like static rather than decoding,
      // and costs a string rebuild per frame for nothing.
      if (now - last > 60) {
        last = now;
        const p = scrollYProgress.get();
        let text = '';

        for (let r = 0; r < ROWS; r += 1) {
          for (let c = 0; c < COLS; c += 1) {
            const word = placed.find((w) => w.row === r && c >= w.col && c < w.col + w.word.length);
            if (word) {
              // A word holds until very late, then goes with everything else.
              text += p > 0.88 ? ' ' : word.word[c - word.col];
              continue;
            }
            text += p > grid[r][c] ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          text += '\n';
        }

        pre.textContent = text;
        pre.style.opacity = String(Math.max(0, 1 - p * 1.1));
        if (img) img.style.opacity = String(0.45 + Math.min(p, 1) * 0.55);
        // The scrim does two jobs: it keeps white characters legible over a
        // pale photograph, and lifting it is most of what makes the picture
        // feel uncovered rather than merely faded up.
        if (scrim) scrim.style.opacity = String(Math.max(0, 0.45 - p * 0.5));
      }
      frame = requestAnimationFrame(paint);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          frame = requestAnimationFrame(paint);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(frame);
        }
      },
      { threshold: 0 },
    );
    if (wrapRef.current) observer.observe(wrapRef.current);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
    };
  }, [prefersReducedMotion, scrollYProgress, words]);

  return (
    <div
      ref={wrapRef}
      className={cn('bg-line-grid relative overflow-hidden rounded-xl', className)}
    >
      {src && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
          style={{ opacity: prefersReducedMotion ? 1 : 0.45 }}
        />
      )}

      {!prefersReducedMotion && (
        <>
          <div
            ref={scrimRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-black"
            style={{ opacity: 0.45 }}
          />
          <pre
            ref={preRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden font-mono leading-tight tracking-tight text-white select-none"
          />
        </>
      )}
    </div>
  );
}
