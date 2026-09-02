import { useEffect, useRef } from 'react';
import { useScroll } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
import { CharacterStream } from './CharacterStream';

interface DecodeRevealProps {
  src?: string;
  alt?: string;
  /** One line each, assembled character by character over the picture. */
  words: string[];
  className?: string;
}

/**
 * A photograph with typography assembled over it, character by character.
 *
 * The lettering is `CharacterStream`: glyphs travel in from the left, settle
 * into words, hold, then leave to the right in reverse order. That is the whole
 * effect now — the field of random characters that used to sit here is gone,
 * because it read as a hacker cipher rather than as type being set, and it
 * competed with the words for the same space.
 *
 * The picture is still tied to scroll: it lifts from dim to full as the section
 * is read, so the reader uncovers it themselves rather than watching it fade on
 * a timer they did not start. The scrim between the two does one job — keeping
 * white letters legible over a pale photograph — and thins as the picture comes
 * up.
 *
 * Under `prefers-reduced-motion` the photograph is simply at full opacity with
 * the words set statically over it. Nothing travels, nothing loops.
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
        lines={words}
        className="text-caption pointer-events-none absolute inset-0 text-white"
      />
    </div>
  );
}
