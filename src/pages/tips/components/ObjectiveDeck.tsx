import { useEffect, useRef } from 'react';
import { Container } from '@/components/layout/Container';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { TipItem } from '../data';
import { TipCard } from './TipCard';

interface DeckCopy {
  title: string;
  description: string;
  items: TipItem[];
}

/**
 * The four aptitude objectives, dealt one at a time from a stack.
 *
 * The club asked for a pinned deck: cards piled on top of each other, the
 * screen held, each card sliding up and away on scroll to reveal the one
 * behind it. This is the second GSAP piece on Placement Prep and deliberately
 * not the same device as the first — the resume tips scatter outward, these
 * advance in order.
 *
 * **Why these four and not another group.** Every card group across the three
 * guides was weighed, and this is the only one that is both real cards and a
 * declared sequence: `TipCard` prints 01 to 04 on them because the club's own
 * material numbers them. A deck deals in order, so here it says what the
 * content already says. The six benefits and the six resume tips are sets
 * whose order is arbitrary, and dealing those would claim a sequence that is
 * not there. The four phases of a round are a sequence, but they are already a
 * timeline with a connector drawn between them, and a deck would throw that
 * away to say the same thing worse.
 *
 * They also gain from it. At desktop these four sat in `grid-cols-4`, about
 * 250px a column, and two of the four bodies run to 120 characters — the
 * widest spread on the page. One card at a time is the width they wanted.
 *
 * **The stack is a one-cell grid, not absolute positioning.** Every card is
 * placed in `col-start-1 row-start-1`, so they overlap, the stage is
 * automatically as tall as the tallest of them, and all four come out the same
 * height. Nothing is measured, nothing shifts after mount, and it stays
 * correct at every width without a resize handler — which matters here
 * precisely because the four cards do not hold the same amount of text.
 *
 * As with `TipFlight`: `Reveal` is dropped on the motion branch, because its
 * `once: false` would re-hide a card the deck is mid-way through dealing, and
 * under `prefers-reduced-motion` none of this loads at all — the static grid
 * below is a different tree, not the same one slowed down.
 */
export function ObjectiveDeck({ copy }: { copy: DeckCopy }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? <StaticGrid copy={copy} /> : <Deck copy={copy} />;
}

/** What the section has always rendered, and still renders without motion. */
function StaticGrid({ copy }: { copy: DeckCopy }) {
  return (
    <Container>
      <SectionHeading
        as="h3"
        measure="measure"
        title={copy.title}
        description={copy.description}
        className="mb-xl"
      />
      <Reveal staggerChildren className="gap-lg tablet:grid-cols-2 desktop:grid-cols-4 grid">
        {copy.items.map((item, index) => (
          <RevealItem key={item.title} className="h-full">
            <TipCard item={item} index={index} />
          </RevealItem>
        ))}
      </Reveal>
    </Container>
  );
}

/**
 * Where a card sits when it is `depth` cards back in the pile.
 *
 * Small numbers on purpose. The cards are the same size, so a card behind only
 * shows the sliver of itself that these offsets expose: 14px of its bottom
 * edge, a little narrower, a little dimmer. That sliver is the whole of what
 * makes it read as a deck rather than as one card.
 */
const slot = (depth: number) => ({
  y: depth * 14,
  scale: 1 - depth * 0.04,
  opacity: 1 - depth * 0.12,
});

function Deck({ copy }: { copy: DeckCopy }) {
  const pin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let context: { revert: () => void } | undefined;
    let cancelled = false;

    // On demand, as `TipFlight` loads it: 45KB of animation library that only
    // two sections on the site have any use for.
    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled || !pin.current) return;

      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-deck-card]');
        if (cards.length < 2) return;

        const deals = cards.length - 1;

        // The pile, before anything is dealt. `zIndex` descending so the first
        // card is the one on top; the values stay in single figures so the
        // sticky topic rail at `z-40` still paints over a card on its way up.
        cards.forEach((card, index) => {
          gsap.set(card, {
            ...slot(index),
            zIndex: cards.length - index,
            // Scaled from the bottom edge, so a card behind keeps its bottom
            // where the offset puts it and the whole 14px shows as a sliver
            // under the front card. Scaled from the top, the shrink eats most
            // of that offset back and the pile reads as a single card with a
            // shadow.
            transformOrigin: '50% 100%',
          });
        });

        const build = (perDeal: number, pinned: boolean) => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: pin.current,
              // Pinned: centred rather than held at the top. The stage is one
              // card tall, so centring balances it in the viewport and, unlike
              // the resume grid, it cannot collide with the 64px header and
              // the 46px rail at any height.
              //
              // Unpinned: the deal plays across the stage's own travel through
              // the viewport instead, which costs no page height at all.
              start: pinned ? 'center center' : 'top 90%',
              end: pinned ? `+=${deals * perDeal}%` : 'bottom 10%',
              pin: pinned,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          for (let deal = 0; deal < deals; deal += 1) {
            // The front card lifts off by its own height, so it clears the
            // pile completely rather than stopping halfway over the next one.
            // `offsetHeight` rather than a rect: it is layout, so it reads the
            // same whether or not the card is mid-transform.
            timeline.to(
              cards[deal],
              {
                y: () => -(cards[deal].offsetHeight + 40),
                // A touch bigger on the way out, which reads as lifting off
                // the pile rather than sliding under the one above it.
                scale: 1.02,
                ease: 'power2.in',
                duration: 1,
              },
              deal,
            );

            // The fade waits until the card is most of the way clear.
            // Fading it while it still covers the card underneath showed both
            // of them at once, two sets of text through each other, which
            // reads as a rendering fault rather than as a card being dealt.
            // Opaque until it is out of the way is also what a real card
            // does: it occludes the next one, then stops being in front of
            // it.
            timeline.to(cards[deal], { opacity: 0, ease: 'power1.in', duration: 0.35 }, deal + 0.6);

            // Everything behind it moves up one place at the same time.
            for (let behind = deal + 1; behind < cards.length; behind += 1) {
              timeline.to(
                cards[behind],
                { ...slot(behind - deal - 1), ease: 'power2.out', duration: 1 },
                deal,
              );
            }
          }
        };

        const media = gsap.matchMedia();

        // 60% of the viewport per card, so four cards cost about 1,600px of
        // scrolling.
        media.add('(min-width: 41rem)', () => build(60, true));

        /* No pin on a phone, and this one is not a taste call.
         *
         * A pin's spacer is sized from the viewport height, and a phone's
         * viewport height changes every time the address bar hides or shows.
         * Measured: the spacer here goes from 1,295px to 1,614px on that
         * change, so the document grows and shrinks by 300px under the
         * reader's thumb while they are scrolling, and everything below it
         * jumps. That is the glitch, and no amount of tuning the deal fixes
         * it while the pin is there.
         *
         * The deal still runs; it is driven by the stage's own travel through
         * the viewport instead. Nothing is held, nothing is added to the page
         * height, and there is no spacer left to resize. */
        media.add('(max-width: 40.999rem)', () => build(0, false));
      }, pin);

      // The guides carry lazy photographs above this, and every trigger point
      // computed before they land is computed against a shorter page.
      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      // `TipsPage` keys the guide subtree on the topic, so switching guides
      // unmounts this mid-pin. Without the revert the pin spacer outlives the
      // deck it was holding.
      context?.revert();
    };
  }, []);

  return (
    <div ref={pin} className="isolate">
      <Container>
        <div className="gap-xl desktop:gap-3xl desktop:grid-cols-2 desktop:items-center grid grid-cols-1">
          <SectionHeading
            as="h3"
            measure="measure"
            title={copy.title}
            description={copy.description}
          />

          {/* One cell, four cards in it. The grid sizes itself to the tallest
              and stretches the rest to match, which is what keeps a 75
              character card and a 121 character one the same shape in a pile
              where there is no row to stretch against. */}
          <div className="grid">
            {copy.items.map((item, index) => (
              <div
                key={item.title}
                data-deck-card
                className="col-start-1 row-start-1 will-change-transform"
              >
                <TipCard item={item} index={index} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
