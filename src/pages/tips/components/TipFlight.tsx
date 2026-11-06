import { useEffect, useRef } from 'react';
import { Container } from '@/components/layout/Container';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { TipItem } from '../data';
import { TipCard } from './TipCard';

/**
 * The six resume tips, flying out of their grid as the reader scrolls.
 *
 * The club asked for the scroll-pinned card flight the reference site uses:
 * the grid holds still long enough to be read, then the cards accelerate out
 * past the camera, scrubbed to the scroll position so going back up puts them
 * back. GSAP's ScrollTrigger does the pinning and the scrubbing; everything it
 * animates is a transform or an opacity, which is the site's standing rule.
 *
 * Four things here are load-bearing and look arbitrary if you do not know why.
 *
 * **The grid is pinned, not the band.** The grey band is 881px tall and the
 * room under the sticky header and topic rail is 600px to 780px depending on
 * the viewport, so pinning the band would hold a block that does not fit and
 * cut its bottom row off. The grid alone is 552px to 596px and fits with room
 * to spare. The heading scrolls away above it, which is what a reader expects
 * of a heading they have already read.
 *
 * **The pinned element is full width and clips horizontally.** A card
 * translated past the viewport edge would otherwise widen the document and
 * hand the page a horizontal scrollbar. Clipping at the pinned element's own
 * box, which is the full page width, means cards vanish exactly where the
 * viewport ends. Vertical overflow is left alone on purpose: clipping it would
 * slice a card in half against an invisible line partway down the band, and
 * there are two more sections below this one for it to overflow harmlessly
 * into.
 *
 * **Perspective sits inside the pinned element, never outside it.** An
 * ancestor with `perspective` becomes the containing block for fixed
 * descendants, and a pinned element is a fixed one. Perspective on a wrapper
 * above the pin would stop the pin working at all.
 *
 * **`Reveal` is gone from this grid.** It would animate the same cards from a
 * second library, and since the club asked for `once: false` it re-hides
 * anything scrolled past, which here is the cards mid-flight. GSAP owns these
 * six cards completely; every other grid on the site keeps Reveal.
 *
 * Under `prefers-reduced-motion` none of this is loaded or mounted: the static
 * grid below is a different tree, not the same tree moving more slowly.
 */
export function TipFlight({ items }: { items: TipItem[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? <StaticGrid items={items} /> : <FlyingGrid items={items} />;
}

/** What the section has always rendered, and still renders without motion. */
function StaticGrid({ items }: { items: TipItem[] }) {
  return (
    <Container>
      <Reveal staggerChildren className="gap-lg tablet:grid-cols-2 desktop:grid-cols-3 grid">
        {items.map((item) => (
          <RevealItem key={item.title} className="h-full">
            <TipCard item={item} />
          </RevealItem>
        ))}
      </Reveal>
    </Container>
  );
}

/**
 * How far into the scrub the cards stay in formation, so they can be read.
 *
 * Measured rather than guessed: the pin is 110% of the viewport, so each
 * hundredth of this is about 10px of scrolling. At 0.22 with an accelerating
 * ease the cards had moved seven pixels by the time the reader was 500px into
 * the pin, which reads as a page that has stopped responding. 0.12 holds the
 * formation for about 120px and then starts moving.
 */
const HOLD = 0.12;

function FlyingGrid({ items }: { items: TipItem[] }) {
  const pin = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let context: { revert: () => void } | undefined;
    let cancelled = false;

    // Loaded on demand rather than imported at the top: GSAP and ScrollTrigger
    // are about 45KB gzipped, and only the resume guide has any use for them.
    // Every other page, and every reader who never reaches this section, pays
    // nothing for it.
    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled || !pin.current || !grid.current) return;

      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-tip-card]');
        if (cards.length === 0) return;

        /**
         * Where a card sits in the grid, as a direction away from its centre.
         *
         * Read from `offsetLeft` and `offsetWidth` rather than
         * `getBoundingClientRect`, which reports the transformed box: once the
         * flight has begun, a rect would measure where the card has flown to
         * and the next refresh would compound it.
         */
        const vector = (card: HTMLElement) => {
          const box = grid.current;
          if (!box) return { dx: 0, dy: 0, w: 0, h: 0 };
          const w = card.offsetWidth;
          const h = card.offsetHeight;
          const halfW = box.offsetWidth / 2 || 1;
          const halfH = box.offsetHeight / 2 || 1;
          return {
            dx: (card.offsetLeft + w / 2 - (box.offsetLeft + halfW)) / halfW,
            dy: (card.offsetTop + h / 2 - (box.offsetTop + halfH)) / halfH,
            w,
            h,
          };
        };

        const media = gsap.matchMedia();

        /* The pinned flight. Desktop only: at `tablet` the grid is two columns
           and 840px tall, which no longer fits the room under the sticky
           chrome, and pinning something taller than its stage is how these
           effects end up cutting their own content off. */
        media.add('(min-width: 64rem)', () => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: pin.current,
              // 130px clears the 64px header and the 46px topic rail with a
              // little air, so the grid pins just below the chrome rather than
              // under it.
              start: 'top 130px',
              end: '+=110%',
              pin: true,
              // Smoothing, not a delay: the cards keep up with a trackpad
              // flick instead of snapping frame to frame with it.
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // The hold. Nothing moves, and the grid is simply the grid the
          // section has always shown.
          timeline.to({}, { duration: HOLD });

          cards.forEach((card, index) => {
            const { dx, dy, w, h } = vector(card);
            // A middle-column card has nowhere to go sideways, so it is given
            // a side of its own rather than being left to fall straight down
            // while everything around it fans out.
            const lateral = Math.abs(dx) < 0.2 ? (index % 2 === 0 ? -0.55 : 0.55) : dx * 1.9;
            // The near row leaves first: it is the one scaling up hardest, so
            // it is the one that reads as closest to the reader.
            const offset = HOLD + (dy > 0 ? 0 : 0.07) + Math.abs(dx) * 0.04;

            gsap.set(card, { zIndex: dy > 0 ? 3 : 2, transformOrigin: '50% 50%' });

            timeline.to(
              card,
              {
                x: lateral * w,
                y: dy * 1.5 * h + 0.3 * h,
                // Toward the reader, against the stage's perspective. This is
                // what makes it a flight past the camera rather than six cards
                // sliding apart on a table.
                z: 400 + index * 28,
                rotate: dx * 15 - dy * 5 + (index % 2 ? 3 : -3),
                duration: 1 - HOLD,
                // Accelerating away, the way something passing you does.
                // `power1.in` rather than `power2.in`: cubed, the first third
                // of the travel covers three percent of the distance, which
                // the reader experiences as nothing happening.
                ease: 'power1.in',
              },
              offset,
            );

            timeline.to(
              card,
              {
                opacity: 0,
                // Gone before it reaches the edge it would otherwise be cut
                // against, which is what makes the clipping invisible. Ending
                // at about 95% of the scrub rather than 88%, so the tail of
                // the pin is not spent on cards nobody can see.
                duration: (1 - HOLD) * 0.45,
                ease: 'power1.in',
              },
              offset + (1 - HOLD) * 0.5,
            );
          });
        });

        /**
         * The flight without a pin, for the widths where the grid is taller
         * than the room it would be pinned in.
         *
         * Same motion, driven by the section's own travel through the
         * viewport instead of by a held stage. The `floor` is what keeps it
         * honest: on a phone these six cards are the advice the reader came
         * for, and fading them out while they are still the only thing on
         * screen trades the content for the effect.
         */
        const drift = (opts: {
          start: string;
          end: string;
          reach: number;
          lift: number;
          depth: number;
          tilt: number;
          floor: number;
        }) => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: grid.current,
              start: opts.start,
              end: opts.end,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });

          cards.forEach((card, index) => {
            const { dx, dy, w, h } = vector(card);
            // A single column gives every card dx = 0, so the fan comes from
            // the index rather than from a layout that has none to give.
            const lateral = Math.abs(dx) < 0.2 ? (index % 2 === 0 ? -1 : 1) : Math.sign(dx);

            gsap.set(card, { zIndex: dy > 0 ? 3 : 2 });

            timeline.to(
              card,
              {
                x: lateral * opts.reach * w,
                y: dy * opts.lift * h,
                z: opts.depth + index * 14,
                rotate: lateral * opts.tilt,
                opacity: opts.floor,
                ease: 'power1.in',
                duration: 1,
              },
              index * 0.05,
            );
          });
        };

        /* Tablet: two columns and 840px tall, which no longer fits the room
           under the sticky chrome, so the same flight runs unpinned. It starts
           later than the phone's so the grid is read before it leaves. */
        media.add('(min-width: 41rem) and (max-width: 63.999rem)', () =>
          drift({
            start: 'top 40%',
            end: 'bottom 20%',
            reach: 0.8,
            lift: 0.35,
            depth: 160,
            tilt: 7,
            floor: 0.2,
          }),
        );

        /* Phone: one column, 1705px of it. There is no grid here to fly out
           of, so this is a drift and a tilt rather than a flight, and the
           cards stay readable the whole way down. An earlier cut of this had
           them at half opacity while they were still the only thing on the
           screen, which is the effect winning an argument it should lose. */
        media.add('(max-width: 40.999rem)', () =>
          drift({
            start: 'top 75%',
            end: 'bottom 25%',
            reach: 0.16,
            lift: 0.05,
            depth: 90,
            tilt: 4,
            floor: 0.85,
          }),
        );
      }, pin);

      // The page grows as lazy images below settle, which moves every trigger
      // point computed before they arrived.
      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      // Reverts every tween, every ScrollTrigger and the pin spacer with them.
      // Without this, switching to another guide leaves a pin holding a grid
      // that is no longer on the page.
      context?.revert();
    };
  }, []);

  return (
    <div ref={pin} className="isolate overflow-x-clip">
      <Container>
        {/* Perspective sits on the grid itself because it reaches one level
            only: on a wrapper above the Container it would project the
            Container, whose flat transform style then flattens the cards back
            out and the depth disappears. It has to be inside the pinned
            element too, since an element with perspective is the containing
            block for fixed descendants and the pin makes one of those. */}
        <div
          ref={grid}
          className="gap-lg tablet:grid-cols-2 desktop:grid-cols-3 grid"
          style={{ perspective: '1400px' }}
        >
          {items.map((item) => (
            <div key={item.title} data-tip-card className="h-full will-change-transform">
              <TipCard item={item} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
