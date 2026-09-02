import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useScroll, type MotionValue } from 'framer-motion';
import { SegmentedTabs } from '@/components/sections/SegmentedTabs';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
import { CHROME, type StackSlide } from './stackTypes';
import { MOVE } from './boardLayout';

interface MobileStackProps {
  slides: StackSlide[];
  tablistLabel: string;
}

/** Screen-heights of scroll each card takes to leave. */
const STEP_VH = 0.7;
/** How far a leaving card travels, as a fraction of the sticky viewport. */
const EXIT = 0.62;

/**
 * The preparation board on a phone: one stack, advanced by scrolling.
 *
 * Nothing here is the desktop composition scaled down. That composition is
 * four previews placed around a centre card, and a phone has no room to place
 * anything around anything — shrunk to fit, the previews become 60px squares
 * with unreadable labels and the whole arrangement stops meaning what it
 * means. So the previews are not laid out at all here. They are the four
 * points, and they live on the back of the card they belong to.
 *
 * Scroll is the way through the deck. The section pins for the length of the
 * stack and each card leaves as it is scrolled, one at a time, revealing the
 * next; the last card does not leave, and the page carries on past it. That is
 * a deliberate asymmetry — a stack that emptied itself at the end would leave
 * a screen-height of nothing under the reader's thumb, and the runway is sized
 * so the last card is what the pin ends on.
 *
 * Scroll is also the only source of truth. The tab bar does not set the index
 * directly; it scrolls to the card, and the scroll sets the index like any
 * other. Two writers on one piece of state is how a control ends up
 * disagreeing with the thing it controls — tap the fourth tab, scroll one
 * pixel, and a directly-set index would snap back.
 *
 * Tapping the card turns it over to the four points. The desktop board puts
 * the flip on the previews and advancing on the centre card, because there
 * both targets exist; here there is one card, and scroll has taken advancing,
 * which leaves the tap free to do the thing the previews used to.
 *
 * Under `prefers-reduced-motion` the pinning goes entirely: no runway, no
 * scroll-driven anything, one card in normal flow with the bar to change it.
 * Taking over the scroll of a page is exactly what that setting is asking you
 * not to do.
 */
export function MobileStack({ slides, tablistLabel }: MobileStackProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const steps = Math.max(1, slides.length - 1);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    if (prefersReducedMotion) return;
    return scrollYProgress.on('change', (p) => {
      const next = Math.min(slides.length - 1, Math.max(0, Math.round(p * steps)));
      setIndex((current) => (current === next ? current : next));
    });
  }, [prefersReducedMotion, scrollYProgress, steps, slides.length]);

  /** Scroll so that card `i` is the one on top. */
  const goTo = (i: number) => {
    // Reduced motion first: that branch renders no runway at all, so looking
    // for one and giving up left the bar inert — the only way to change card
    // when there is no scrolling to do.
    if (prefersReducedMotion) {
      setIndex(i);
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const travel = track.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: track.offsetTop + travel * (i / steps),
      behavior: 'smooth',
    });
  };

  const tabs = slides.map((slide) => ({ id: slide.id, label: slide.category }));

  const bar = (
    // `mt-2xl`, not `mt-lg`. The gap is measured from the top card, but the
    // deck peeks 9% of a card below it — at 24px the bar cleared the lowest
    // card edge by 2px and read as stuck to the stack.
    <div className="px-gutter mt-2xl flex justify-center">
      <SegmentedTabs
        tabs={tabs}
        value={slides[index]?.id ?? slides[0].id}
        onChange={(id) => goTo(slides.findIndex((slide) => slide.id === id))}
        layoutId="case-study-tab"
        ariaLabel={tablistLabel}
        compact
      />
    </div>
  );

  if (prefersReducedMotion) {
    return (
      <div className="px-gutter">
        <div className="mx-auto w-[min(88vw,380px)]">
          <Card slide={slides[index] ?? slides[0]} />
        </div>
        {bar}
      </div>
    );
  }

  return (
    <div ref={trackRef} style={{ height: `${100 + steps * STEP_VH * 100}svh` }}>
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center">
        <div className="px-gutter relative w-full">
          <div className="relative mx-auto w-[min(88vw,380px)]">
            {slides.map((slide, i) => (
              <StackedCard
                key={slide.id}
                slide={slide}
                index={i}
                steps={steps}
                total={slides.length}
                progress={scrollYProgress}
                isTop={i === index}
              />
            ))}
          </div>
        </div>

        {bar}
      </div>
    </div>
  );
}

/**
 * One card in the scrolling stack.
 *
 * A card's whole life is one function of where the page is: it rises out of
 * the pile as its turn approaches, sits still while it is on top, and leaves
 * upward. The card behind it is doing the first of those at the same moment,
 * which is what makes the swap read as one movement rather than two.
 *
 * **The values are written by hand rather than piped through `useTransform`.**
 * A `useTransform` reading a scroll value gets compiled to a native scroll
 * timeline, and a keyframe range that covers only part of the scroll does not
 * clamp outside itself — measured, the first card was back at full opacity by
 * the end of the deck, so three slides' text showed through the card on top.
 * Setting the values in a subscription keeps them plain, applied as written,
 * and defined for every position rather than only inside one card's window.
 *
 * Only the first card is laid out in flow; the rest are absolutely positioned
 * on top of it. A stack of five in flow would be five card-heights tall, and
 * the sticky viewport would show the top of the first and nothing else.
 */
function StackedCard({
  slide,
  index,
  steps,
  total,
  progress,
  isTop,
}: {
  slide: StackSlide;
  index: number;
  steps: number;
  total: number;
  progress: MotionValue<number>;
  isTop: boolean;
}) {
  const y = useMotionValue('0%');
  const scale = useMotionValue(1);
  const opacity = useMotionValue(1);

  useEffect(() => {
    const start = index / steps;
    const step = 1 / steps;

    const apply = (p: number) => {
      // How far past this card's own turn the page is, in card-steps: 0 as it
      // takes the top, 1 once it has gone. The last card's `start` is 1, so
      // this never goes positive for it and it never leaves — which is what
      // ends the pin on a card rather than on an empty screen.
      const d = (p - start) / step;

      if (d >= 1) {
        y.set(`${-EXIT * 100}%`);
        scale.set(1);
        opacity.set(0);
        return;
      }

      if (d >= 0) {
        y.set(`${-EXIT * 100 * d}%`);
        scale.set(1);
        // Gone by 0.9 of the step, not at 1.0. Ending exactly on the boundary
        // left a card at a few percent whenever the scroll sat just short of
        // it — and tapping one focuses its button, which scrolls the page a
        // couple of pixels and did exactly that: the previous slide's text
        // ghosted through the card that had just been turned over.
        opacity.set(d < 0.7 ? 1 : Math.max(0, 1 - (d - 0.7) / 0.2));
        return;
      }

      // Waiting behind, capped at two deep: past that the cards are stacked in
      // the same place, which is what keeps a deck of any length the same
      // height as a deck of three.
      const behind = Math.min(2, -d);
      y.set(`${behind <= 1 ? 5 * behind : 5 + 4 * (behind - 1)}%`);
      scale.set(behind <= 1 ? 1 - 0.03 * behind : 0.97 - 0.03 * (behind - 1));
      opacity.set(1);
    };

    apply(progress.get());
    return progress.on('change', apply);
  }, [progress, index, steps, y, scale, opacity]);

  return (
    <motion.div
      style={{ y, scale, opacity, zIndex: total - index, pointerEvents: isTop ? 'auto' : 'none' }}
      // `relative` on the in-flow card as well, because `z-index` is ignored
      // on a static element: without it the absolutely positioned cards behind
      // painted straight over the first one, and the deck opened on the second
      // slide.
      className={cn('relative w-full', index > 0 && 'absolute inset-x-0 top-0')}
      aria-hidden={!isTop}
    >
      <Card slide={slide} interactive={isTop} />
    </motion.div>
  );
}

function Card({ slide, interactive = true }: { slide: StackSlide; interactive?: boolean }) {
  const [flipped, setFlipped] = useState(false);

  // A card that scrolls away while turned over would come back turned over.
  useEffect(() => {
    if (!interactive) setFlipped(false);
  }, [interactive]);

  // `overflow-hidden` on both faces is load-bearing, not tidiness. A face is
  // absolutely positioned, so anything longer than the card does not stretch
  // it — it spills out and lands on top of the cards underneath. Before this,
  // three slides' worth of text were legible at once through one card.
  //
  // The explicit `rotateY(0deg)` on the front is load-bearing too:
  // `backface-visibility` only applies to an element the browser is already
  // treating as 3D, so an untransformed front face stayed visible through the
  // back and the two sides were readable at the same time.
  const face =
    'absolute inset-0 flex flex-col overflow-hidden bg-white p-2.5 [backface-visibility:hidden]';

  return (
    <button
      type="button"
      onClick={() => setFlipped((current) => !current)}
      aria-pressed={flipped}
      aria-label={`${slide.category}. ${flipped ? 'Show the description' : 'Show the four points'}`}
      className="focus-visible:ring-accent block w-full rounded-[12px] text-left focus-visible:ring-2"
      style={{ perspective: 1200 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: MOVE.ease }}
        // A fixed height rather than one the content sets: the two faces hold
        // different amounts of text, and a box that resized as it turned would
        // change size mid-rotation. Sized against the screen so the card and
        // the bar below it both fit the pinned viewport.
        className="relative h-[min(56svh,420px)] w-full [transform-style:preserve-3d]"
      >
        <div className={cn(face, '[transform:rotateY(0deg)]')} style={CHROME}>
          {/* The picture takes what the text leaves. `min-h-0` because a flex
              child refuses to shrink below its content otherwise, which is
              what pushed the paragraph off the bottom of the card. */}
          <div className="bg-line-grid min-h-0 w-full flex-1 overflow-hidden rounded-[9px]">
            {slide.image && (
              <img
                src={slide.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            )}
          </div>
          <div className="shrink-0 px-1 pt-3">
            <h3
              className="font-serif"
              style={{ fontSize: 28, lineHeight: 0.95, letterSpacing: '-1px' }}
            >
              {slide.category}
            </h3>
            <p
              className="text-text-muted line-clamp-4"
              style={{ fontSize: 13.5, lineHeight: 1.3, marginTop: 6 }}
            >
              {slide.description}
            </p>
          </div>
        </div>

        <div className={cn(face, '[transform:rotateY(180deg)]')} style={CHROME}>
          <p className="text-eyebrow text-text-subtle shrink-0 px-1 pt-1 uppercase">
            {slide.category}
          </p>
          <ul className="mt-sm flex min-h-0 flex-1 flex-col justify-evenly px-1 pb-1">
            {slide.thumbnails.map((thumb) => (
              <li key={thumb.tag} className="border-border border-t py-2 first:border-t-0">
                <p className="text-label">{thumb.tag}</p>
                <p className="text-caption text-text-muted mt-0.5">{thumb.flipText}</p>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </button>
  );
}
