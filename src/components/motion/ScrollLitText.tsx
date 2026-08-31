import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

interface ScrollLitTextProps {
  /**
   * Plain text, one paragraph per entry. Word-level animation has to own the
   * string, so this takes strings rather than markup — same constraint as
   * `TextReveal`.
   */
  paragraphs: readonly string[];
  className?: string;
}

/**
 * Where in the viewport the reading line sits, as `useScroll` offsets.
 *
 * The block starts lighting when its top reaches 80% down the screen and is
 * fully lit when its bottom passes 55%, so the last word lands a little above
 * the middle of the screen rather than at the very bottom edge — the text
 * finishes where you are actually looking.
 */
const OFFSET: ['start 0.8', 'end 0.55'] = ['start 0.8', 'end 0.55'];

/**
 * How much of the scroll each word's own fade occupies. Longer than one word's
 * share of the range, so neighbouring words overlap and the lit edge reads as
 * a soft sweep instead of a row of individual switches flicking on.
 */
const WORD_SPAN = 0.12;

/** The dimmed state. Legible enough to read ahead, dim enough for the sweep to register. */
const DIM = 0.18;

function Word({
  children,
  progress,
  start,
}: {
  children: string;
  progress: MotionValue<number>;
  start: number;
}) {
  const opacity = useTransform(progress, [start, start + WORD_SPAN], [DIM, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}
    </motion.span>
  );
}

/**
 * A block of prose that lights up word by word as it is scrolled through.
 *
 * The distinction from `TextReveal` is what drives it. `TextReveal` plays once
 * on a timer when a headline arrives; this is tied to scroll position, so the
 * reader is the one moving the lit edge and can stop, reverse, and re-read.
 * That makes it usable on a long paragraph, where a timed reveal would either
 * outrun a slow reader or hold up a fast one.
 *
 * Every word's opacity is a `useTransform` off one shared scroll progress, so
 * the whole block animates on motion values with no React state and no
 * re-render per frame — the same rule the rest of the site's pointer and
 * scroll work follows.
 *
 * Accessibility: the paragraph text is the real DOM text, split only at spaces
 * and reassembled with them, so it selects, searches and reads normally. The
 * dimmed state is a low opacity rather than a low-contrast colour, and because
 * every word ends at full opacity the finished state has the section's normal
 * contrast. Under reduced motion the words are rendered plain and fully lit —
 * nothing to scroll through and nothing to wait for.
 */
export function ScrollLitText({ paragraphs, className }: ScrollLitTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: OFFSET });

  // One flat list across all paragraphs, so the sweep runs continuously
  // through the block instead of restarting at each paragraph break.
  const total = paragraphs.reduce((sum, p) => sum + p.split(' ').length, 0);

  let cursor = 0;

  return (
    <div ref={ref} className={cn('gap-lg flex flex-col', className)}>
      {paragraphs.map((paragraph, pi) => (
        <p key={pi}>
          {paragraph.split(' ').map((word, wi) => {
            // `1 - WORD_SPAN` keeps the last word's fade inside the range;
            // without it the final words never reach full opacity.
            const start = (cursor++ / total) * (1 - WORD_SPAN);
            return (
              <span key={wi}>
                {prefersReducedMotion ? (
                  word
                ) : (
                  <Word progress={scrollYProgress} start={start}>
                    {word}
                  </Word>
                )}{' '}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
