import { useState } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { HOME_PILLARS } from '../data';

interface PillarCirclesProps {
  /** The parent section's scroll progress, 0–1 across its pinned travel. */
  progress: MotionValue<number>;
  reduced: boolean;
}

/**
 * Where in the section's travel the circles do their work.
 *
 * They start after the photograph columns have arrived, so the two motions
 * read in sequence rather than competing, and they finish before the end so
 * the completed row is held on screen for a beat rather than snapping away
 * with the scroll.
 */
const START = 0.42;
const END = 0.92;
/** Fraction of that window one circle occupies. Overlaps its neighbour, so the
    row fills as a wave rather than as five separate events. */
const SPAN = 0.34;

/** The ring's geometry, in the SVG's own units. */
const R = 46;
/** What a pillar is before the scroll reaches it: a bead sitting on the wire. */
const BEAD = 4.5;

const FILL_SPRING = { type: 'spring', stiffness: 320, damping: 26 } as const;

function Pillar({
  pillar,
  index,
  count,
  progress,
  active,
  onSelect,
}: {
  pillar: (typeof HOME_PILLARS)[number];
  index: number;
  count: number;
  progress: MotionValue<number>;
  active: boolean;
  onSelect: () => void;
}) {
  const from = START + (index / count) * (END - START - SPAN);
  const to = from + SPAN;

  // One value drives the whole pillar, so nothing can arrive out of step with
  // anything else: the bead swells, turns hollow, and its contents fade up.
  const grow = useTransform(progress, [from, to], [0, 1]);
  const radius = useTransform(grow, [0, 1], [BEAD, R]);
  // The solid bead fades out over the first half of its own growth and the
  // ring fades in over the second, so there is a moment where it is neither
  // quite a dot nor quite a ring — which is what makes it read as one thing
  // opening rather than two things crossfading.
  const beadOpacity = useTransform(grow, [0, 0.45], [1, 0]);
  const ringOpacity = useTransform(grow, [0.2, 0.65], [0, 1]);
  const contentOpacity = useTransform(grow, [0.6, 1], [0, 1]);
  const Icon = pillar.icon;

  return (
    <motion.li className="shrink-0">
      <motion.button
        type="button"
        // Hover, focus and tap all select. Hover alone left every sentence
        // unreachable on a touchscreen and to anyone navigating by keyboard —
        // measured on an iPhone profile, all five sat at opacity 0 and zero
        // height, so a third of this section's content did not exist there.
        onPointerEnter={onSelect}
        onFocus={onSelect}
        onClick={onSelect}
        whileHover={{ scale: 1.05 }}
        transition={FILL_SPRING}
        className="group relative flex aspect-square w-[clamp(6rem,10vw,10.5rem)] items-center justify-center rounded-full"
      >
        {/* No `-rotate-90` any more: nothing is traced from twelve o'clock, so
            there is no dash start to place. */}
        <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full">
          {/* Opaque, and painted first. It is what the connecting thread runs
              behind rather than through — the same trick the process timeline
              uses to make its spine read as running between the stages. It
              grows with the ring, so a bead that has not opened yet does not
              punch a hole in the wire it is sitting on. */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="currentColor"
            className="text-surface"
            style={{ opacity: ringOpacity }}
          />

          {/* The bead. A solid dot on the wire that swells into the ring. */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="currentColor"
            className="text-text"
            style={{ opacity: beadOpacity }}
          />

          {/* The selected disc. Radius follows the growth as well, so selecting
              a pillar mid-scroll cannot paint a full-size disc inside a ring
              that is still opening. */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="currentColor"
            className="text-accent"
            // Opacity is animated, never also given as a motion value here:
            // a `style` motion value overrides the same key in `animate`, so
            // setting both painted this disc on every ring as it opened
            // instead of on the selected one.
            style={{ transformOrigin: '50% 50%' }}
            initial={false}
            animate={{ scale: active ? 1 : 0.55, opacity: active ? 1 : 0 }}
            transition={FILL_SPRING}
          />

          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            className={`duration-base ease-out-brand transition-colors ${
              active ? 'text-accent' : 'text-border-strong group-hover:text-text'
            }`}
            style={{ opacity: ringOpacity }}
          />
        </svg>

        {/* Absolutely positioned, and that is load-bearing rather than tidy. In
            normal flow the label grew the button's box, and an `aspect-square`
            box that grows in one axis stops being square — the ring rendered
            as an ellipse. Measured at 1024px: a 102px-wide ring 198px tall.
            Out of flow, nothing inside can change the box. */}
        <motion.span
          style={{ opacity: contentOpacity }}
          className={`duration-base ease-out-brand absolute inset-0 flex flex-col items-center justify-center px-[11%] text-center transition-colors ${
            active ? 'text-accent-fg' : ''
          }`}
        >
          <Icon
            size={20}
            strokeWidth={1.5}
            aria-hidden="true"
            className={active ? '' : 'text-text-muted group-hover:text-text'}
          />
          <span className="text-caption wide:text-label mt-2 block">{pillar.title}</span>
        </motion.span>

        {/* The sentence is shown once, below the row, for whichever pillar is
            selected. Every pillar still carries its own copy here, because
            assistive technology cannot hover and should not have to infer that
            the caption belongs to this button. */}
        <span className="sr-only">{pillar.body}</span>
      </motion.button>
    </motion.li>
  );
}

/**
 * The five pillars, as beads on a wire that open into rings as it is scrolled.
 *
 * The reference this came from cycles one circle at a time behind paging dots.
 * That is the wrong shape for this page twice over: it hides four of five
 * things at any moment, and it runs on a timer inside a section whose entire
 * argument is already tied to scroll position. Here all five are present and
 * the scroll opens them, one beginning before the last has finished so the row
 * fills as a wave. Scroll back and they close again.
 *
 * They open by growing, not by tracing. The previous version drew each ring's
 * stroke clockwise from twelve o'clock, which is a well-worn effect and said
 * nothing about what these are — a traced ring reads as a progress meter, and
 * none of these five is a measure of anything. Growing from a dot on the wire
 * says the opposite and the true thing: the thread comes first and each pillar
 * is something on it. It also means every pillar exists on screen before its
 * turn, as a bead waiting, rather than five gaps that fill in.
 *
 * A hairline runs behind the row and fills on the same progress, so the five
 * arrive as one system being threaded rather than five objects appearing near
 * each other. It is the process timeline's spine turned on its side, and it
 * disappears the moment the row wraps, because a straight line drawn through
 * two rows of circles connects nothing.
 *
 * The sentences live in one caption beneath the row rather than inside the
 * rings, which fixed two measured faults. Inside a ring the text grew the box
 * and flattened the circle into an ellipse at narrow widths; and being
 * hover-only, it was unreachable on every touchscreen. One caption is legible
 * at any ring size, reserves its own height so nothing shifts, and answers
 * hover, focus and tap alike.
 *
 * Under reduced motion the rings are complete and every sentence is simply
 * printed, since there is nothing to reveal and nothing to wait for.
 */
export function PillarCircles({ progress, reduced }: PillarCirclesProps) {
  // Defaults to the first pillar so the caption is never an empty reserved box
  // waiting to be earned.
  const [active, setActive] = useState(0);

  // The same window the rings use, so the thread reaches a ring exactly as
  // that ring begins to draw.
  const threadScale = useTransform(progress, [START, END], [0, 1]);

  if (reduced) {
    return (
      <ul className="gap-lg mt-2xl flex flex-wrap justify-center">
        {HOME_PILLARS.map((pillar) => (
          <li key={pillar.id} className="max-w-[16rem] text-center">
            <p className="text-label">{pillar.title}</p>
            <p className="text-caption text-text-muted mt-1">{pillar.body}</p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-xl">
      <div className="relative">
        {/* Inset to the ring centres so the thread never pokes out past the
            first and last ring. Desktop only — below that the row wraps. */}
        <div
          aria-hidden="true"
          className="desktop:block absolute top-1/2 right-[10%] left-[10%] hidden h-px -translate-y-1/2"
        >
          <div className="border-border-strong h-full w-full border-t border-dashed" />
          <motion.div
            className="bg-text absolute inset-0 h-px origin-left"
            style={{ scaleX: threadScale }}
          />
        </div>

        <ul
          // `gap-xs`, and the step matters. Five rings plus four gaps have to
          // fit the 54vw the photograph columns leave: at 1024px that is 553px
          // against 5 x 102px of ring, so the four gaps have 43px between
          // them. `gap-sm` is 12px — 48px in total — and those five pixels
          // were enough to drop the fifth ring onto a line of its own.
          // `flex-wrap` stays as the safety net rather than the plan.
          className="gap-xs relative flex flex-wrap justify-center"
        >
          {HOME_PILLARS.map((pillar, index) => (
            <Pillar
              key={pillar.id}
              pillar={pillar}
              index={index}
              count={HOME_PILLARS.length}
              progress={progress}
              active={index === active}
              onSelect={() => setActive(index)}
            />
          ))}
        </ul>
      </div>

      {/* Height is reserved for the longest sentence, so selecting a different
          pillar never moves the page under the pointer. `key` remounts the
          line, which is a fade-in with no exit to wait on — this repo has been
          bitten once by an exit callback that never fired in production. */}
      <p aria-hidden="true" className="mt-lg min-h-[4.5rem] text-center">
        <motion.span
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-body text-text-muted mx-auto block max-w-[46ch]"
        >
          {HOME_PILLARS[active].body}
        </motion.span>
      </p>
    </div>
  );
}
