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

function Pillar({
  pillar,
  index,
  count,
  progress,
}: {
  pillar: (typeof HOME_PILLARS)[number];
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const from = START + (index / count) * (END - START - SPAN);
  const to = from + SPAN;

  const draw = useTransform(progress, [from, to], [CIRCUMFERENCE, 0]);
  const scale = useTransform(progress, [from, to], [0.72, 1]);
  const opacity = useTransform(progress, [from, from + SPAN * 0.45], [0, 1]);
  const Icon = pillar.icon;

  return (
    <motion.li
      style={{ scale, opacity }}
      whileHover={{ scale: 1.06 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative flex aspect-square w-[clamp(7rem,10vw,10.5rem)] shrink-0 items-center justify-center"
    >
      {/* The ring is an SVG stroke rather than a CSS border because a border
          can only appear, where a stroke can be drawn. `-rotate-90` puts the
          start of the dash at the top, so it draws clockwise from twelve
          o'clock instead of from three. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full -rotate-90 overflow-visible"
      >
        <motion.circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          className="text-border-strong group-hover:text-text duration-base ease-out-brand transition-colors"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset: draw }}
        />
      </svg>

      {/* Padding in `%` rather than a fixed step: the circle is fluid, and a
          20px gutter that is comfortable at 168px crowds the text at 112px. */}
      <div className="px-[14%] text-center">
        <Icon
          size={20}
          strokeWidth={1.5}
          aria-hidden="true"
          className="text-text-muted group-hover:text-text duration-base mx-auto transition-colors"
        />
        <p className="text-label mt-2">{pillar.title}</p>
        {/* The body is the reward for hovering. Five circles each carrying
            three lines of text at this size is a wall; the title alone is
            scannable, and the sentence is there when one is worth reading.
            Height rather than display, so it can animate. */}
        <p className="text-caption text-text-muted duration-base ease-out-brand grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] group-hover:grid-rows-[1fr] group-hover:opacity-100">
          <span className="overflow-hidden">{pillar.body}</span>
        </p>
      </div>
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
 * Under reduced motion the rings are simply complete and the bodies are always
 * visible, since there is no hover on the devices most likely to ask for it.
 */
export function PillarCircles({ progress, reduced }: PillarCirclesProps) {
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
    <ul className="mt-xl gap-sm tablet:gap-md flex flex-wrap justify-center">
      {HOME_PILLARS.map((pillar, index) => (
        <Pillar
          key={pillar.id}
          pillar={pillar}
          index={index}
          count={HOME_PILLARS.length}
          progress={progress}
        />
      ))}
    </ul>
  );
}
