import { useEffect, useRef } from 'react';
import { useScroll } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
import { CharacterStream } from './CharacterStream';

interface DecodeRevealProps {
  src?: string;
  alt?: string;
  /** What is left standing when the character field clears. */
  words: string[];
  className?: string;
}

/**
 * A photograph uncovered by a stream of characters running across it.
 *
 * The lettering is `CharacterStream`, and the mechanism is the reference's: a
 * field of random characters is written across the picture, and the words are
 * what is left standing when that field clears behind the writing head. Nothing
 * travels to a destination — see the note there.
 *
 * The picture is tied to scroll: it lifts from dim to full as the section is
 * read, so the reader uncovers it themselves rather than watching it fade on a
 * timer they did not start. The scrim between the two does one job — keeping
 * white characters legible over a pale photograph — and thins as the picture
 * comes up.
 *
 * Under `prefers-reduced-motion` the photograph is simply at full opacity with
 * the words set statically over it. Nothing streams, nothing loops.
 */
export function DecodeReveal({ src, alt = '', words, className }: DecodeRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start 0.9', 'end 0.35'],
  });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const img = imgRef.current;
    const scrim = scrimRef.current;

    // Reads the scroll value on a frame rather than subscribing per pixel: two
    // style writes a frame, and no React render at any point.
    const unsubscribe = scrollYProgress.on('change', (p) => {
      if (img) img.style.opacity = String(0.5 + Math.min(p, 1) * 0.5);
      if (scrim) scrim.style.opacity = String(Math.max(0, 0.42 - p * 0.34));
    });
    return unsubscribe;
  }, [prefersReducedMotion, scrollYProgress]);

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
          style={{ opacity: prefersReducedMotion ? 1 : 0.5 }}
        />
      )}

      {!prefersReducedMotion && (
        <div
          ref={scrimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: 0.42 }}
        />
      )}

      <CharacterStream
        words={words}
        className="text-caption pointer-events-none absolute inset-0 text-white"
      />
    </div>
  );
}
