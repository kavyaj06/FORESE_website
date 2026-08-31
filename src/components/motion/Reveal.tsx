import type { ElementType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeInOnly, riseIn, riseScaleIn, stagger } from './variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface RevealProps {
  children: ReactNode;
  /** Stagger direct children instead of animating the block as one unit. */
  staggerChildren?: boolean;
  /** Delay in seconds before the reveal starts. */
  delay?: number;
  /** `scale` adds a slight settle, for cards and image tiles. */
  motionStyle?: 'rise' | 'scale';
  as?: ElementType;
  className?: string;
}

/**
 * Reveals its content once, the first time it scrolls into view.
 *
 * `once: true` is deliberate — re-animating on every scroll-back is the single
 * most common way scroll animation turns from polish into an irritant.
 *
 * Under `prefers-reduced-motion` the movement is dropped and only opacity
 * changes, so the content still appears but nothing slides.
 */
export function Reveal({
  children,
  staggerChildren = false,
  delay = 0,
  motionStyle = 'rise',
  as = 'div',
  className,
}: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  const variants = prefersReducedMotion
    ? fadeInOnly
    : staggerChildren
      ? stagger
      : motionStyle === 'scale'
        ? riseScaleIn
        : riseIn;

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      // `amount: 'some'` — any part of the element entering — rather than a
      // ratio. A ratio is a trap on a tall block: the largest intersection
      // ratio an element can ever reach is viewport height over its own
      // height, so anything taller than the viewport divided by the threshold
      // can never meet it and stays invisible for good. The team page's member
      // grid is 6757px, which is past that ceiling on a 700px-tall window and
      // under it on a 982px one — the same page appearing or not depending on
      // how tall the browser happens to be. The negative bottom margin still
      // holds the reveal until the element is properly on screen.
      viewport={{ once: true, amount: 'some', margin: '0px 0px -60px 0px' }}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/**
 * A single item inside a `<Reveal staggerChildren>`.
 * Inherits the parent's animation state, so it needs no props of its own.
 */
export function RevealItem({
  children,
  as = 'div',
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag variants={prefersReducedMotion ? fadeInOnly : riseIn} className={className}>
      {children}
    </MotionTag>
  );
}
