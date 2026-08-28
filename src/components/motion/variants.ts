import type { Variants, Transition } from 'framer-motion';

/**
 * Shared framer-motion values.
 *
 * Every animation on the site pulls from here, which is what makes the motion
 * feel like one hand rather than a dozen ad-hoc choices. The easing matches
 * `--ease-out-brand` in theme.css.
 */

export const EASE_OUT_BRAND = [0.16, 1, 0.3, 1] as const;

export const transition: Transition = {
  duration: 0.35,
  ease: EASE_OUT_BRAND,
};

/** Section entering the viewport on scroll. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition },
};

/** Reduced-motion equivalent: state change without movement. */
export const fadeInOnly: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

/**
 * Parent that reveals its children one after another.
 * Pair with `riseIn` on each child.
 */
export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** Route change. Deliberately quicker than a section reveal — navigation
    should feel immediate, not cinematic. */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE_OUT_BRAND } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};
