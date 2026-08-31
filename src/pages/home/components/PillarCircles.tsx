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
const CIRCUMFERENCE = 2 * Math.PI * R;

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

  const draw = useTransform(progress, [from, to], [CIRCUMFERENCE, 0]);
  const scale = useTransform(progress, [from, to], [0.72, 1]);
  const opacity = useTransform(progress, [from, from + SPAN * 0.45], [0, 1]);
  const Icon = pillar.icon;

  return (
    <motion.li style={{ scale, opacity }} className="shrink-0">
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
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full -rotate-90 overflow-visible"
        >
          {/* Opaque, and painted first. It is what the connecting thread runs
              behind rather than through — the same trick the process timeline
              uses to make its spine read as running between the stages. */}
          <circle cx="50" cy="50" r={R} fill="currentColor" className="text-surface" />

          {/* The selected disc. Scaling out from the centre rather than fading
              gives the fill somewhere to come from. */}
          <motion.circle
            cx="50"
            cy="50"
            r={R}
            fill="currentColor"
            className="text-accent"
            style={{ transformOrigin: '50% 50%' }}
            initial={false}
            animate={{ scale: active ? 1 : 0.55, opacity: active ? 1 : 0 }}
            transition={FILL_SPRING}
          />

          {/* The ring is an SVG stroke rather than a CSS border because a
              border can only appear, where a stroke can be drawn. `-rotate-90`
              puts the start of the dash at the top, so it draws clockwise from
              twelve o'clock instead of from three. */}
          <motion.circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinecap="round"
            className={`duration-base ease-out-brand transition-colors ${
              active ? 'text-accent' : 'text-border-strong group-hover:text-text'
            }`}
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset: draw }}
          />
        </svg>

        {/* Absolutely positioned, and that is load-bearing rather than tidy. In
            normal flow the label grew the button's box, and an `aspect-square`
            box that grows in one axis stops being square — the ring rendered
            as an ellipse. Measured at 1024px: a 102px-wide ring 198px tall.
            Out of flow, nothing inside can change the box. */}
        <span
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
        </span>

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
 * The five pillars, as rings that draw themselves as the section is scrolled.
 *
 * The reference this came from cycles one circle at a time behind paging dots.
 * That is the wrong shape for this page twice over: it hides four of five
 * things at any moment, and it runs on a timer inside a section whose entire
 * argument is already tied to scroll position. Here all five are present and
 * the scroll draws them — each ring traced clockwise from twelve o'clock, one
 * beginning before the last has finished so the row fills as a wave. Scroll
 * back and they un-draw.
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
