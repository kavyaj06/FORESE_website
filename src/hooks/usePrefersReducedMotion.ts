import { useMediaQuery } from './useMediaQuery';

/**
 * True when the visitor has asked their OS to minimise animation.
 *
 * CSS-driven motion is already handled globally in styles/animations.css.
 * This hook is for the JS side — chiefly framer-motion, which needs to be
 * told to skip a transition rather than merely run it very fast.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
