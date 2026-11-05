import { motion } from 'framer-motion';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { drawIn } from '@/components/motion/variants';
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
 * in CSS. A segment per step ends exactly where the next node begins, and the
 * last step simply has none.
 *
 * **The segment turns with the layout.** The grid is four columns on a
 * desktop, two at tablet and one on a phone, and the connector used to be
 * `desktop:block hidden` — so on the viewport most students read this on, the
 * one genuinely procedural block on the page arrived as four unordered
 * paragraphs. Now it runs down the column below the mobile breakpoint and
 * across the row above it: `left-5` is the centre of a `size-10` node,
 * `-bottom-xl` crosses the grid's own `gap-xl` to reach the next one, and at
 * `desktop` the same span flips to `top-5 left-10 -right-xl`. One element,
 * both directions, nothing hidden on either.
 *
 * The step number is new too, and it is there for the same reason. An `<ol>`
 * says "sequence" to a screen reader and nothing at all to an eye, and the
 * timing labels ("First 2-3 minutes", "Middle phase") only imply an order if
 * you read all four. The numerals match the ones the rail at the top of the
 * page and the tip cards already use, so this is the page's own convention
 * rather than a new one.
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
        <RevealItem
          key={title}
          as="li"
          className="gap-md desktop:gap-sm desktop:flex-col relative flex"
        >
          {index < phases.length - 1 && (
            // Drawn from the node outwards as its step arrives, so the rail
            // builds itself in the order it is meant to be read. No variants
            // under reduced motion: the span then sits at its CSS default,
            // which is the finished line.
            //
            // Hidden on the last item of a tablet row as well, where a
            // vertical segment would point at the item beside it rather than
            // the one below. `tablet:hidden desktop:block` is the narrowest
            // way to say that without knowing the row index.
            <motion.span
              aria-hidden="true"
              variants={prefersReducedMotion ? undefined : drawIn}
              className={[
                'bg-border absolute origin-top-left',
                // Phone: down the column, from under the node to the next.
                '-bottom-xl top-10 left-5 w-px',
                // Tablet: two columns, so a connector cannot be trusted to
                // point anywhere useful.
                'tablet:hidden',
                // Desktop: back across the row.
                'desktop:-right-xl desktop:top-5 desktop:bottom-auto desktop:left-10 desktop:block desktop:h-px desktop:w-auto',
              ].join(' ')}
            />
          )}

          <span
            aria-hidden="true"
            className="border-border bg-bg text-text rounded-pill relative z-10 flex size-10 shrink-0 items-center justify-center border"
          >
            <Icon size={18} strokeWidth={1.75} />
          </span>

          {/* Beside the node below `desktop`, under it above. The spine runs
              down the middle of the node column, so the text has to sit out
              of its way: with the content directly underneath, the hairline
              drew straight through the paragraph. */}
          <div className="gap-sm desktop:mt-sm flex flex-col">
            <p className="text-eyebrow text-text-subtle gap-xs flex items-center uppercase">
              <span className="text-text tabular-nums">{String(index + 1).padStart(2, '0')}</span>
              <span aria-hidden="true">/</span>
              {timing}
            </p>
            <h4 className="text-body font-semibold">{title}</h4>
            <p className="text-small text-text-muted">{body}</p>
          </div>
        </RevealItem>
      ))}
    </Reveal>
  );
}
