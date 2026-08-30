import type { ElementType } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT_BRAND } from './variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface TextRevealProps {
  /** Plain text. Word-level animation needs to own the string, not markup. */
  text: string;
  as?: ElementType;
  className?: string;
  /** Seconds before the first word starts. */
  delay?: number;
  /**
   * Hold the words down until this is true. The opening curtain uses it: a
   * headline that reveals itself behind an overlay has already finished by
   * the time anyone can see it.
   */
  play?: boolean;
}

/**
 * Headline that rises word by word from behind a mask.
 *
 * This is the one piece of motion that most makes a page feel designed rather
 * than merely animated: the words are clipped by their own box, so they appear
 * to slide up from behind the line above instead of fading in place.
 *
 * Accessibility: the real string is on `aria-label` and every visual word is
 * `aria-hidden`, so assistive tech reads one sentence rather than a stack of
 * disconnected words. Under reduced motion it renders as plain text with no
 * wrappers at all.
 */
export function TextReveal({
  text,
  as: Tag = 'span',
  className,
  delay = 0,
  play = true,
}: TextRevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const words = text.split(' ');

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} aria-hidden="true">
          {/* The padding/negative-margin pair gives descenders room inside the
              clipping box; without it, every g and y is sliced off. */}
          <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: '115%' }}
              animate={{ y: play ? '0%' : '115%' }}
              transition={{ duration: 0.85, ease: EASE_OUT_BRAND, delay: delay + index * 0.075 }}
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
