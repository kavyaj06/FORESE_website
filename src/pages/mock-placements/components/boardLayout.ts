/**
 * Every measurement of the case-study board, in one place.
 *
 * These are supplied values, not derived ones. They are here rather than
 * inline in the component so that the composition can be read — and adjusted —
 * as a set of numbers that clearly belong together, which is what a spec that
 * says "do not improvise the proportions" actually asks for.
 *
 * Pixels rather than percentages, deliberately. The brief fixes a 440x622 card
 * against a 1568px content area; expressing that as a percentage would make it
 * drift with the viewport, which is the opposite of what was asked. Responsive
 * behaviour is three explicit sets of numbers below, not one set scaled.
 */

export interface CardBox {
  width: number;
  height: number;
}

export interface Placed extends CardBox {
  x: number;
  y: number;
  scale?: number;
}

/** The featured card, and the picture inside it. */
export const FEATURED = { width: 440, height: 622 } as const;
export const FEATURED_IMAGE = 410;

/**
 * The four cards showing behind the featured one, so all five are on screen.
 *
 * Scales are read off the reference. Measuring the width of each visible edge
 * against the featured card's own width gives 0.81, 0.70, 0.62 and 0.56 — a
 * falloff that steepens with depth rather than a constant step, which is what
 * makes the deck look like it recedes rather than like five sizes of the same
 * card. A uniform step reads as a fan; this reads as perspective.
 *
 * Centred on one axis, with no horizontal jitter. The reference's five cards
 * share a centre line to within a pixel, and the symmetry is what lets the
 * eye read the widths as depth.
 *
 * `y` is derived, not measured. A card at scale `s` has height `622s`, so
 * centred at `y` its top edge is at `y - 311s`; putting that 30px further above
 * the featured card's own top edge (-311) for each layer gives the values
 * below. Read straight off a screenshot the y values would carry the error of
 * every pixel I misjudged; derived, the slivers are exactly 30, 60, 90 and 120.
 */
const SLIVER_STEP = 30;
const STACK_SCALES = [0.81, 0.7, 0.62, 0.56];

export const STACK: Placed[] = STACK_SCALES.map((scale, i) => ({
  ...FEATURED,
  x: 0,
  y: -(FEATURED.height / 2) * (1 - scale) - SLIVER_STEP * (i + 1),
  scale,
}));

/**
 * The four cards set well away from the centre. Sizes differ on purpose: four
 * identical squares would read as a grid that happens to have a hole in it.
 */
export const SATELLITES: Placed[] = [
  { width: 175, height: 175, x: -520, y: -250 },
  { width: 218, height: 218, x: 565, y: -215 },
  { width: 218, height: 218, x: -565, y: 250 },
  { width: 178, height: 178, x: 545, y: 325 },
];

/** Tablet: the brief's own smaller card, with the offsets pulled in by a quarter. */
export const TABLET_FEATURED = { width: 380, height: 540 } as const;
export const TABLET_IMAGE = 350;
export const TABLET_OFFSET_SCALE = 0.75;
/** Four is a crowd at this width; the brief allows dropping to three. */
export const TABLET_SATELLITE_COUNT = 3;

/** Phone: two previews, and a card that sizes to the screen rather than to a grid. */
export const MOBILE_SATELLITE_COUNT = 2;

/**
 * The one transition in the composition.
 *
 * 1.15s is long for an interface and right for this one: the card is not
 * appearing, it is travelling, and a journey that takes 300ms reads as a cut.
 * The curve is the brief's — a hard decelerate with no overshoot, which is why
 * a spring is explicitly wrong here. A spring's overshoot would put two cards
 * at a similar size at the moment it passes its target, and the composition
 * has exactly one rule: one card is the featured one at every instant.
 */
export const MOVE = {
  duration: 1.15,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

/**
 * The card leaving the centre uses a shorter version of the same curve.
 *
 * With both cards on 1.15s the swap is symmetric — one going 1 to 0.88 while
 * the other goes 0.88 to 1 — so they pass through the same scale at the
 * midpoint. Measured: the runner-up reached 1.00x the featured card's scale.
 * The brief's one hard rule is that a single card reads as featured at every
 * instant, and two cards at an identical size is the one arrangement that
 * breaks it.
 *
 * Leaving sooner than the other arrives means the outgoing card is already
 * smaller by the time the incoming one is growing, so the two are never the
 * same size. The curve is unchanged, so the movement still reads as one
 * gesture rather than two.
 */
export const MOVE_OUT = {
  duration: 0.8,
  ease: MOVE.ease,
};

/** Where the composition's centre sits inside the canvas. */
export const CENTRE_Y = '57%';

/**
 * The canvas has to be tall enough to hold the composition it is given.
 *
 * With the centre at 57%, the lowest element is the bottom-right preview: 325px
 * below centre plus half its own 178px height, so 414px. For that to sit inside
 * the canvas, 0.43H must be at least 414 — which puts the floor at 963px, not
 * the brief's 760. At 760 the bottom preview was simply cut off by the canvas's
 * own `overflow: hidden`.
 *
 * Raising the floor rather than moving the composition up keeps every supplied
 * position exactly as given, including the 57% the brief is explicit about.
 */
export const CANVAS_MIN_HEIGHT = 963;
