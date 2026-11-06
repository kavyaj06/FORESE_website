import { useEffect, useRef, type ReactNode } from 'react';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface ScrollSettleProps<T> {
  items: readonly T[];
  /** A stable key per item. The grids this wraps are all keyed by title. */
  getKey: (item: T) => string;
  children: (item: T, index: number) => ReactNode;
  /** The grid classes. Identical in both branches, so the layout never moves. */
  className?: string;
}

/**
 * A grid of cards that assembles itself as you scroll into it.
 *
 * The third scroll device on Placement Prep and deliberately the quietest.
 * The resume tips scatter out of their grid and the aptitude objectives are
 * dealt from a pile; both of those are pinned, and a third pin on the longest
 * guide of the three would be a page that stops the reader twice more on the
 * way down. So this one holds nothing: the cards arrive from slightly off
 * their own positions, turned a few degrees and set back in depth, and settle
 * square as the grid comes up the screen. Scrubbed, so it runs backwards if
 * you do.
 *
 * It replaces `Reveal` on the grids it wraps rather than joining it. Reveal
 * animates the same property from a second library, and its `once: false`
 * would re-hide a card this is part way through settling.
 *
 * Worth saying what this is not: it is not the resume fly-out run backwards.
 * That one disperses six cards whose order does not matter, as a send-off.
 * This one assembles them, as an arrival, and ends at the layout the section
 * has always had rather than leaving the screen empty.
 */
export function ScrollSettle<T>({ items, getKey, children, className }: ScrollSettleProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? (
    <StaticGrid items={items} getKey={getKey} className={className}>
      {children}
    </StaticGrid>
  ) : (
    <SettlingGrid items={items} getKey={getKey} className={className}>
      {children}
    </SettlingGrid>
  );
}

/** What the grid has always rendered, and still renders without motion. */
function StaticGrid<T>({ items, getKey, children, className }: ScrollSettleProps<T>) {
  return (
    <Reveal staggerChildren className={className}>
      {items.map((item, index) => (
        <RevealItem key={getKey(item)} className="h-full">
          {children(item, index)}
        </RevealItem>
      ))}
    </Reveal>
  );
}

function SettlingGrid<T>({ items, getKey, children, className }: ScrollSettleProps<T>) {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let context: { revert: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled || !grid.current) return;

      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        const box = grid.current;
        const cards = gsap.utils.toArray<HTMLElement>('[data-settle]');
        if (!box || cards.length === 0) return;

        /**
         * Which side of the grid a card is on, as -1, 0 or +1.
         *
         * `offsetLeft` rather than a rect, for the reason the other two
         * components give: a rect reports the transformed box, so once a card
         * has been moved the next refresh would measure where it was moved to
         * and compound it.
         */
        const side = (card: HTMLElement, index: number) => {
          const offset =
            card.offsetLeft + card.offsetWidth / 2 - (box.offsetLeft + box.offsetWidth / 2);
          // A single column puts every card dead centre, so the alternation
          // comes from the index instead of from a layout that has none.
          return Math.abs(offset) < 8 ? (index % 2 === 0 ? -1 : 1) : Math.sign(offset);
        };

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: box,
            start: 'top 85%',
            // Settled by the time the grid is two thirds up the screen, so a
            // reader is never reading a card that is still moving.
            end: 'bottom 70%',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        cards.forEach((card, index) => {
          const dir = side(card, index);
          timeline.fromTo(
            card,
            { y: 56, x: dir * 26, rotate: dir * 3, z: -200, opacity: 0 },
            { y: 0, x: 0, rotate: 0, z: 0, opacity: 1, ease: 'power2.out', duration: 1 },
            index * 0.12,
          );
        });
      }, grid);

      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return (
    // Perspective on the grid itself, which is the one level it reaches. The
    // cards travel in `z`, so without it they would simply fade and slide.
    <div ref={grid} className={className} style={{ perspective: '1400px' }}>
      {items.map((item, index) => (
        <div key={getKey(item)} data-settle className="h-full will-change-transform">
          {children(item, index)}
        </div>
      ))}
    </div>
  );
}
