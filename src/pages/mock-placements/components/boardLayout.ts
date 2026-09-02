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
 * The four cards set away from the centre. Sizes differ on purpose: four
 * identical squares would read as a grid that happens to have a hole in it.
 *
 * Pulled in from the original ±565/±545 by about 15%. At the old spread the
 * composition needed 1348px of width, so on a 1024 laptop the fourth card was
 * simply outside the canvas — three showed and one was sliced. Closer also
 * reads better: cards that far out stop belonging to the deck in the middle
 * and start looking like four unrelated things near the corners.
 */
export const SATELLITES: Placed[] = [
  { width: 175, height: 175, x: -442, y: -212 },
  { width: 218, height: 218, x: 480, y: -183 },
  { width: 218, height: 218, x: -480, y: 212 },
  { width: 178, height: 178, x: 463, y: 276 },
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

/**
 * How far the composition reaches from its own centre, in its own units.
 *
 * Measured from the numbers actually in use rather than written down, because
 * a hand-kept extent is wrong the first time anybody nudges a card. The stack
 * is included: a buried card is scaled about its centre, so its top edge is
 * `-y + height * scale / 2`, which reaches higher than the featured card's own
 * top even though the card is smaller.
 */
export function stageExtent(card: CardBox, satellites: Placed[], offsetScale: number) {
  let halfWidth = card.width / 2;
  let above = card.height / 2;
  let below = card.height / 2;

  for (const slot of STACK) {
    above = Math.max(above, -slot.y * offsetScale + (card.height * (slot.scale ?? 1)) / 2);
  }
  for (const slot of satellites) {
    halfWidth = Math.max(halfWidth, Math.abs(slot.x) * offsetScale + slot.width / 2);
    above = Math.max(above, -slot.y * offsetScale + slot.height / 2);
    below = Math.max(below, slot.y * offsetScale + slot.height / 2);
  }

  return { width: halfWidth * 2, height: above + below, above, below };
}

/**
 * Where the composition's centre sits inside the canvas — derived, not chosen.
 *
 * The brief fixed it at 57%, and that was the source of the clipping: the
 * composition reaches further above its centre than below, so putting that
 * centre below the canvas's middle pushed the bottom card off the edge. The
 * canvas floor was then raised to 963px to make room, which on a laptop is
 * taller than the screen — so the card was inside the canvas and still below
 * the fold, which is the same thing to a reader.
 *
 * Splitting the canvas in the ratio the composition actually needs is the only
 * value that cannot clip, and it recovers about 7% of scale over 57%.
 */
export function centreFraction(extent: { above: number; height: number }) {
  return extent.above / extent.height;
}

/** Breathing room between the composition and the canvas edge, in canvas px. */
export const STAGE_PADDING = 16;

/**
 * The canvas no longer has to be tall enough for the composition: the
 * composition is scaled to the canvas. This is a floor for legibility, not for
 * geometry — below it the cards are too small to read whatever fits.
 */
export const CANVAS_MIN_HEIGHT = 600;
