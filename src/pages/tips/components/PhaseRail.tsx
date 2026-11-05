import { motion } from 'framer-motion';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { drawX } from '@/components/motion/variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { DiscussionPhase } from '../data';

interface PhaseRailProps {
  phases: DiscussionPhase[];
}

/**
 * The four phases of a discussion, laid out as a rail.
 *
 * A grid rather than four cards: these are one sequence, and a card apiece
 * reads as four unrelated pieces of advice.
 *
 * The hairline is drawn once per step rather than once behind the whole row.
 * A single line spanning the grid has to end somewhere, and both ends are
 * wrong: stopped at the grid's edge it runs past the last node and implies a
 * fifth step, and there is no way to express "the centre of the last column"
 * in CSS. A segment per step ends exactly where the next node begins —
 * `left-10` clears the node it leaves (`size-10`), `-right-xl` crosses the
 * grid's own `gap-xl` — and the last step simply has none.
 */
export function PhaseRail({ phases }: PhaseRailProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Reveal
      staggerChildren
      as="ol"
      className="tablet:grid-cols-2 desktop:grid-cols-4 gap-xl relative grid grid-cols-1"
    >
      {phases.map(({ icon: Icon, title, timing, body }, index) => (
        <RevealItem key={title} as="li" className="gap-sm relative flex flex-col">
          {index < phases.length - 1 && (
            // Drawn left to right behind each node as its step arrives, so
            // the rail builds itself in the order it is meant to be read.
            // No variants under reduced motion: the span then sits at its CSS
            // default, which is the finished line.
            <motion.span
              aria-hidden="true"
              variants={prefersReducedMotion ? undefined : drawX}
              className="bg-border desktop:block -right-xl absolute top-5 left-10 hidden h-px origin-left"
            />
          )}

          <span
            aria-hidden="true"
            className="border-border bg-bg text-text rounded-pill relative z-10 flex size-10 items-center justify-center border"
          >
            <Icon size={18} strokeWidth={1.75} />
          </span>

          <p className="text-eyebrow text-text-subtle mt-sm uppercase">{timing}</p>
          <h4 className="text-body font-semibold">{title}</h4>
          <p className="text-small text-text-muted">{body}</p>
        </RevealItem>
      ))}
    </Reveal>
  );
}
