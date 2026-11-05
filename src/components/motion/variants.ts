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
  duration: 0.55,
  ease: EASE_OUT_BRAND,
};

/** Section entering the viewport on scroll.
    The travel is deliberately larger than a token 8px nudge — motion that is
    too small to notice costs the same to run and reads as no motion at all. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition },
};

/** For cards and tiles: adds a slight scale so the element feels like it
    settles into place rather than merely sliding. */
export const riseScaleIn: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT_BRAND },
  },
};

/**
 * A hairline that draws itself as its row arrives.
 *
 * Pair with `origin-left` on the element, and nest it inside a `RevealItem`
 * so it inherits that item's `hidden`/`visible` state rather than needing a
 * viewport observer of its own — one observer per row instead of two.
 *
 * Delayed past the row's own rise, so the line is drawn onto a node that has
 * already arrived rather than travelling with it.
 */
export const drawX: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5, ease: EASE_OUT_BRAND, delay: 0.18 } },
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
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Route change. Deliberately quicker than a section reveal — navigation
    should feel immediate, not cinematic. */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE_OUT_BRAND } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};
