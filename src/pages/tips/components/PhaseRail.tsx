import { useEffect, useRef } from 'react';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { DiscussionPhase } from '../data';

interface PhaseRailProps {
  phases: DiscussionPhase[];
}

/** The classes the connector wears, shared by both branches so it cannot drift. */
const LINE = [
  'bg-accent absolute origin-top-left',
  // Phone: down the column, from under the node to the next.
  '-bottom-xl top-10 left-5 w-px',
  // Tablet: two columns, so a connector cannot be trusted to point anywhere
  // useful.
  'tablet:hidden',
  // Desktop: back across the row.
  'desktop:-right-xl desktop:top-5 desktop:bottom-auto desktop:left-10 desktop:block desktop:h-px desktop:w-auto',
].join(' ');

const NODE =
  'border-border bg-bg text-text rounded-pill relative z-10 flex size-10 shrink-0 items-center justify-center border';

const ITEM = 'gap-md desktop:gap-sm desktop:flex-col relative flex';

const RAIL = 'tablet:grid-cols-2 desktop:grid-cols-4 gap-xl relative grid grid-cols-1';

/**
 * The four phases of a discussion, laid out as a rail that draws itself.
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
 * **It is now drawn to the scroll position rather than on arrival.** It used
 * to play once as the row came into view, all four segments at a fixed
 * stagger, which said "this animates" but not "this is a sequence". Scrubbed,
 * the reader advances the line themselves: a node lights, its text arrives,
 * the hairline runs from it to the next node, and that one lights in turn.
 * The rail is the one block on Placement Prep where the order is the content,
 * so it is the one place that earns being walked through.
 *
 * **Which axis the segment grows along is a per breakpoint decision.** The
 * same span is a 1px wide column on a phone and a 1px tall row at desktop.
 * Scaling both axes at once, which is what the old shared variant did, draws
 * a line that thickens into place rather than one that extends; it was
 * invisible as a one shot and would be obvious scrubbed.
 *
 * Under `prefers-reduced-motion` the static rail below is rendered instead,
 * finished: every node lit, every line full length, nothing to scroll
 * through.
 */
export function PhaseRail({ phases }: PhaseRailProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? <StaticRail phases={phases} /> : <DrawnRail phases={phases} />;
}

/** The rail as it has always looked, complete, with the site's usual arrival. */
function StaticRail({ phases }: PhaseRailProps) {
  return (
    <Reveal staggerChildren as="ol" className={RAIL}>
      {phases.map(({ icon: Icon, title, timing, body }, index) => (
        <RevealItem key={title} as="li" className={ITEM}>
          {index < phases.length - 1 && <span aria-hidden="true" className={LINE} />}
          <span aria-hidden="true" className={NODE}>
            <Icon size={18} strokeWidth={1.75} />
          </span>
          <PhaseText index={index} timing={timing} title={title} body={body} />
        </RevealItem>
      ))}
    </Reveal>
  );
}

function DrawnRail({ phases }: PhaseRailProps) {
  const rail = useRef<HTMLOListElement>(null);

  useEffect(() => {
    let context: { revert: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled || !rail.current) return;

      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        const nodes = gsap.utils.toArray<HTMLElement>('[data-rail-node]');
        const texts = gsap.utils.toArray<HTMLElement>('[data-rail-text]');
        const lines = gsap.utils.toArray<HTMLElement>('[data-rail-line]');
        if (nodes.length === 0) return;

        /**
         * One walk down the rail.
         *
         * `axis` is the only thing that differs between the breakpoints, and
         * the segment is 1px on its other dimension, so growing the wrong one
         * would make the line appear rather than extend.
         */
        const walk = (axis: 'scaleX' | 'scaleY') => {
          gsap.set(lines, { scaleX: axis === 'scaleX' ? 0 : 1, scaleY: axis === 'scaleY' ? 0 : 1 });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: rail.current,
              start: 'top 80%',
              end: 'bottom 40%',
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          });

          nodes.forEach((node, index) => {
            // The node first, because the line is drawn from it.
            timeline.fromTo(
              node,
              { opacity: 0.25, scale: 0.8 },
              { opacity: 1, scale: 1, ease: 'power2.out', duration: 0.5 },
              index,
            );

            timeline.fromTo(
              texts[index],
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, ease: 'power2.out', duration: 0.6 },
              index + 0.12,
            );

            // Then the run to the next node, which is what makes the fourth
            // phase feel like the end of something rather than the fourth of
            // four paragraphs.
            if (lines[index]) {
              timeline.to(lines[index], { [axis]: 1, ease: 'none', duration: 0.55 }, index + 0.45);
            }
          });
        };

        const media = gsap.matchMedia();
        media.add('(min-width: 64rem)', () => walk('scaleX'));
        media.add('(max-width: 63.999rem)', () => walk('scaleY'));
      }, rail);

      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return (
    <ol ref={rail} className={RAIL}>
      {phases.map(({ icon: Icon, title, timing, body }, index) => (
        <li key={title} className={ITEM}>
          {index < phases.length - 1 && <span data-rail-line aria-hidden="true" className={LINE} />}
          <span data-rail-node aria-hidden="true" className={NODE}>
            <Icon size={18} strokeWidth={1.75} />
          </span>
          <PhaseText index={index} timing={timing} title={title} body={body} animated />
        </li>
      ))}
    </ol>
  );
}

/**
 * One phase's words.
 *
 * Beside the node below `desktop`, under it above. The spine runs down the
 * middle of the node column, so the text has to sit out of its way: with the
 * content directly underneath, the hairline drew straight through the
 * paragraph.
 */
function PhaseText({
  index,
  timing,
  title,
  body,
  animated = false,
}: {
  index: number;
  timing: string;
  title: string;
  body: string;
  animated?: boolean;
}) {
  return (
    <div
      {...(animated ? { 'data-rail-text': true } : {})}
      className="gap-sm desktop:mt-sm flex flex-col"
    >
      <p className="text-eyebrow text-text-subtle gap-xs flex items-center uppercase">
        <span className="text-text tabular-nums">{String(index + 1).padStart(2, '0')}</span>
        <span aria-hidden="true">/</span>
        {timing}
      </p>
      <h4 className="text-body font-semibold">{title}</h4>
      <p className="text-small text-text-muted">{body}</p>
    </div>
  );
}
