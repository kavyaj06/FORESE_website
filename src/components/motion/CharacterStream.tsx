import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

interface CharacterStreamProps {
  /** The words that survive the stream, in the order they are written. */
  words: string[];
  className?: string;
}

const GLYPHS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Seconds. */
const WRITE = 3.2;
const HOLD = 1.6;
const UNWRITE = 2.6;
const PAUSE = 0.4;

/** Characters. How far behind the head the random field has faded to nothing. */
const FADE = 260;
/** Characters. How long a glyph keeps re-rolling before it settles. */
const SCRAMBLE = 10;

/** A monospace glyph's advance, as a fraction of its font size. */
const ADVANCE = 0.6;
const LINE = 1.55;
/** Fraction of the box the field occupies. */
const FILL = 0.9;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Deterministic pseudo-random in [0, 1) — see the note on the tape. */
function hash(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * The tape: one long line of characters with the words set into it.
 *
 * Built once from a hash of each index rather than from `Math.random`, because
 * the field has to be the same on every loop and every render. Random noise
 * would be a different picture each pass, so the animation could never be
 * looked at twice, compared against itself, or tested.
 *
 * Words are spaced evenly along the tape and nudged off a row boundary if they
 * would wrap, because a word split across two lines never reads as a word.
 */
function buildTape(length: number, cols: number, words: string[]) {
  const chars: string[] = [];
  const isWord: boolean[] = [];
  for (let i = 0; i < length; i += 1) {
    chars.push(GLYPHS[Math.floor(hash(i) * GLYPHS.length)]);
    isWord.push(false);
  }

  const gap = Math.floor(length / (words.length + 1));
  words.forEach((word, w) => {
    let at = gap * (w + 1) + Math.floor(hash(w * 31) * gap * 0.4) - Math.floor(gap * 0.2);
    at = Math.max(0, Math.min(at, length - word.length - 1));
    // Push the word to the next row rather than let it wrap.
    const room = cols - (at % cols);
    if (room < word.length) at += room;
    if (at + word.length >= length) return;
    for (let k = 0; k < word.length; k += 1) {
      chars[at + k] = word[k];
      isWord[at + k] = true;
    }
  });

  return { chars, isWord };
}

/**
 * A stream of characters written across a region, out of which words resolve.
 *
 * Taken from the reference frame by frame, and it is not a text reveal. There
 * is one tape of random characters with the words set into it, wrapped into
 * lines across the box. A writing head runs along that tape; ahead of it there
 * is nothing, at it the glyphs churn, and behind it the random characters fade
 * away while the words stay. So the words are not animated into place — they
 * are what is left when the noise around them clears, which is why they end up
 * scattered at the positions the wrapping happened to give them.
 *
 * Running the head backwards is the exit: characters past it un-write from the
 * end, the field around it comes back, and the words are taken apart by the
 * same stream that made them rather than faded out.
 *
 * **This replaced a version where each letter flew in from off-screen to its
 * final spot.** That is a different effect — letters arriving independently at
 * arbitrary positions — and it is what the reference is not doing. Here no
 * character ever moves: position is fixed by the grid, and everything is
 * carried by which glyph is shown and how bright it is.
 *
 * The whole animation is a pure function of one clock, so it cannot drift, and
 * it runs only while the figure is on screen. Under `prefers-reduced-motion`
 * the words are simply set out, with no field and no loop.
 */
export function CharacterStream({ words, className }: CharacterStreamProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLSpanElement[]>([]);
  const tapeRef = useRef<{ chars: string[]; isWord: boolean[] }>({ chars: [], isWord: [] });
  const [grid, setGrid] = useState({ cols: 0, rows: 0, size: 0 });

  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      if (!width || !height) return;

      // The field is sized from the box, so the same composition holds at any
      // width instead of being a grid of numbers that only suits one screen.
      const size = Math.max(11, Math.min(20, width / 34));
      const cols = Math.floor((width * FILL) / (size * ADVANCE));
      const rows = Math.floor((height * FILL) / (size * LINE));
      setGrid((current) =>
        current.cols === cols && current.rows === rows && current.size === size
          ? current
          : { cols, rows, size },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const total = grid.cols * grid.rows;

  useEffect(() => {
    if (!total) return;
    tapeRef.current = buildTape(total, grid.cols, words);
  }, [total, grid.cols, words]);

  useEffect(() => {
    if (prefersReducedMotion || !total) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const cycle = WRITE + HOLD + UNWRITE + PAUSE;
    const end = total + FADE;
    let frame = 0;
    let started = 0;
    let last = 0;
    let running = false;

    const paint = (now: number) => {
      if (!started) started = now;
      // ~24 repaints a second. The churn is meant to read as characters
      // settling, and at 60 it reads as static.
      if (now - last > 42) {
        last = now;
        const t = ((now - started) / 1000) % cycle;

        // The head runs to `total + FADE`, not to `total`. Stopping at the end
        // of the tape leaves its last FADE characters still inside the fade
        // band, so that trailing block sits frozen on screen for the whole
        // hold. Running the head off the end lets the field clear behind it
        // and the hold is words only, which is the point of the hold.
        let head: number;
        if (t < WRITE) head = (t / WRITE) * end;
        else if (t < WRITE + HOLD) head = end;
        else if (t < WRITE + HOLD + UNWRITE) head = end * (1 - (t - WRITE - HOLD) / UNWRITE);
        else head = 0;

        const { chars, isWord } = tapeRef.current;

        for (let i = 0; i < total; i += 1) {
          const node = nodesRef.current[i];
          if (!node) continue;

          const behind = head - i;
          if (behind <= 0) {
            // Not written yet, or already un-written.
            node.style.opacity = '0';
            continue;
          }

          // Just behind the head a glyph is still churning; past that it is
          // whatever the tape says. This is where a word "resolves": its own
          // letters stop rolling and stay while the noise around them goes.
          const settling = behind < SCRAMBLE;
          const glyph = settling
            ? GLYPHS[(Math.random() * GLYPHS.length) | 0]
            : (chars[i] ?? ' ');
          if (node.textContent !== glyph) node.textContent = glyph;

          node.style.opacity = isWord[i]
            ? String(0.55 + clamp01(behind / SCRAMBLE) * 0.45)
            : String(clamp01(1 - behind / FADE) * 0.5);
        }
      }
      frame = requestAnimationFrame(paint);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          started = 0;
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
  }, [prefersReducedMotion, total]);

  if (prefersReducedMotion) {
    return (
      <div className={cn('gap-x-lg gap-y-xs flex flex-wrap items-center font-mono', className)}>
        {words.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </div>
    );
  }

  const advance = grid.size * ADVANCE;
  const lineHeight = grid.size * LINE;
  const originX = (wrapRef.current?.clientWidth ?? 0) * ((1 - FILL) / 2);
  const originY = (wrapRef.current?.clientHeight ?? 0) * ((1 - FILL) / 2);

  return (
    <div ref={wrapRef} className={cn('relative overflow-hidden font-mono', className)}>
      {/* The words as real text. The field is one element per character and
          would otherwise be announced as several hundred loose letters. */}
      <span className="sr-only">{words.join('. ')}</span>

      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          ref={(node) => {
            if (node) nodesRef.current[i] = node;
          }}
          className="absolute top-0 left-0 leading-none whitespace-pre select-none"
          style={{
            fontSize: grid.size,
            opacity: 0,
            transform: `translate3d(${originX + (i % grid.cols) * advance}px, ${
              originY + Math.floor(i / grid.cols) * lineHeight
            }px, 0)`,
          }}
        />
      ))}
    </div>
  );
}
