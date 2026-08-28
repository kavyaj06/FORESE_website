import type { ElementType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeInOnly, riseIn, stagger } from './variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface RevealProps {
  children: ReactNode;
  /** Stagger direct children instead of animating the block as one unit. */
  staggerChildren?: boolean;
  /** Delay in seconds before the reveal starts. */
  delay?: number;
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
  as = 'div',
  className,
}: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  const variants = prefersReducedMotion ? fadeInOnly : staggerChildren ? stagger : riseIn;

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -80px 0px' }}
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
