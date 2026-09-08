import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { ScrubbedTabs } from './ScrubbedTabs';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
import { CHROME, type StackSlide, type StackThumb } from './stackTypes';
import { MobileStack } from './MobileStack';
import {
  CANVAS_MIN_HEIGHT,
  centreFraction,
  FEATURED,
  FEATURED_IMAGE,
  MOBILE_SATELLITE_COUNT,
  MOVE,
  MOVE_OUT,
  SATELLITES,
  STAGE_PADDING,
  STACK,
  stageExtent,
  TABLET_FEATURED,
  TABLET_IMAGE,
  TABLET_OFFSET_SCALE,
  TABLET_SATELLITE_COUNT,
} from './boardLayout';

/**
 * Screen-heights of scroll each card takes to arrive.
 *
 * Shorter than the phone board's 0.7. There a whole card travels the height of
 * the screen to leave; here the deck barely moves — the cards swap depth in
 * place — so the same allowance would read as scrolling through a section that
 * had stopped responding.
 */
const STEP_VH = 0.65;

export type { StackSlide, StackThumb } from './stackTypes';

interface CaseStudyStackProps {
  slides: StackSlide[];
  tablistLabel: string;
}

/**
 * A stack of project cards on a canvas, advanced two ways.
 *
 * **Scroll is the only thing that changes which card is on top.** The section
 * pins for the length of the deck and the scroll position is the index; the
 * order is derived from it — the deck cut at that card — so nothing else holds
 * a copy of what is featured. The tab strip and the card do not set the index,
 * they scroll to it, which is the same rule the phone board already runs on:
 * two writers on one piece of state is how a control ends up disagreeing with
 * the thing it controls.
 *
 * That also makes the strip below a genuine readout rather than a second
 * control. It slides its labels past a stationary pill as the deck advances —
 * see `ScrubbedTabs` — which is only honest because the scroll really is what
 * moves both.
 *
 * **Every card is the same size in the DOM, and scale does the rest.** This is
 * what lets the brief's rule hold: nothing animates width, height, top or left,
 * only transform and opacity, which the compositor can do without touching
 * layout. Cards are re-indexed rather than re-created, so each is animated from
 * where it was to where it now belongs.
 *
 * **One card reads as featured at every instant.** That is the composition's
 * only hard rule, and it is why a spring is explicitly wrong: a spring
 * overshoots, and at the moment it passes its target the outgoing and incoming
 * cards are briefly the same size. A hard decelerate never does that.
 *
 * The satellites are not part of the deck. They are labelled previews set well
 * away from the centre, and they own the flip — the featured card is the thing
 * you click to advance, so giving it a hover that turns it over would put two
 * gestures on one target with no way to tell them apart.
 */
export function CaseStudyStack({ slides, tablistLabel }: CaseStudyStackProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const isDesktop = useMediaQuery('(min-width: 1200px)');
  const isTablet = useMediaQuery('(min-width: 768px)');

  const flipEnabled = canHover && !prefersReducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const steps = Math.max(1, slides.length - 1);

  // Declared before the phone branch returns, like every other hook here. The
  // runway only exists on this branch, and `useScroll` on a ref that never
  // attaches simply reports zero.
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
    // Reduced motion first. That branch renders no runway, so looking for one
    // and giving up would leave the strip inert — and it is then the only way
    // to change card at all.
    if (prefersReducedMotion) {
      setIndex(i);
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const travel = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: track.offsetTop + travel * (i / steps), behavior: 'smooth' });
  };

  const order = useMemo(() => {
    const ids = slides.map((slide) => slide.id);
    return [...ids.slice(index), ...ids.slice(0, index)];
  }, [slides, index]);

  const topId = order[0];
  const top = slides.find((slide) => slide.id === topId) ?? slides[0];

  // The stage's real size, not the viewport's. `100vh` is not what this
  // element gets — a mobile browser's chrome takes a slice of it — and the
  // stage is capped at 1440px inside a wider window, so measuring the
  // full-bleed canvas behind it would over-report the room available.
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const measure = () =>
      setCanvas((current) =>
        current.width === node.clientWidth && current.height === node.clientHeight
          ? current
          : { width: node.clientWidth, height: node.clientHeight },
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Three explicit sets of numbers rather than one set scaled by the viewport,
  // which is what "do not make it responsive by randomly scaling these" asks
  // for. `null` means the composition does not fit and the phone layout runs.
  const card = isDesktop ? FEATURED : isTablet ? TABLET_FEATURED : null;
  const imageSize = isDesktop ? FEATURED_IMAGE : TABLET_IMAGE;
  const offsetScale = isDesktop ? 1 : TABLET_OFFSET_SCALE;
  const satelliteCount = isDesktop
    ? SATELLITES.length
    : isTablet
      ? TABLET_SATELLITE_COUNT
      : MOBILE_SATELLITE_COUNT;

  const transition = prefersReducedMotion ? { duration: 0.2 } : MOVE;
  const outTransition = prefersReducedMotion ? { duration: 0.2 } : MOVE_OUT;

  // Below the tablet width the composition is not scaled down, it is replaced.
  // Four previews placed around a centre card is the whole idea, and a phone
  // has nowhere to place them; shrunk to fit they become unreadable squares
  // and the arrangement stops meaning anything. See `MobileStack`.
  if (!card) return <MobileStack slides={slides} tablistLabel={tablistLabel} />;

  // Every position below stays exactly as specified; the whole composition is
  // scaled to whatever canvas the device gives it. Fitting the stage once is
  // the only way all four previews are on screen at every width — nudging
  // individual offsets until they happen to fit one laptop is how the fourth
  // one ended up sliced on every other.
  const satellites = SATELLITES.slice(0, satelliteCount);
  const extent = card
    ? stageExtent(card, satellites, offsetScale)
    : { width: 1, height: 1, above: 0.5, below: 0.5 };
  const centreY = `${(centreFraction(extent) * 100).toFixed(3)}%`;
  // Before the first measurement there is nothing to fit to, and a zero-width
  // box would compute a negative scale and flip the whole board inside out.
  const fit =
    canvas.width && canvas.height
      ? Math.min(
          1,
          (canvas.width - STAGE_PADDING * 2) / extent.width,
          (canvas.height - STAGE_PADDING * 2) / extent.height,
        )
      : 1;

  // The runway, and the pinned screen inside it. Under reduced motion there is
  // neither: taking over the page's scroll for four screen-heights is exactly
  // what that setting asks you not to do, so the board is one screen in normal
  // flow and the strip is a plain control again.
  const board = (
    <div
      className={cn(
        'flex flex-col',
        prefersReducedMotion ? undefined : 'sticky top-0 h-screen overflow-hidden',
      )}
    >
      <div
        className={cn(
          'bg-board-canvas bg-board-dots relative overflow-hidden',
          prefersReducedMotion ? '[height:calc(100vh-145px)]' : 'min-h-0 flex-1',
        )}
        style={{ minHeight: prefersReducedMotion ? CANVAS_MIN_HEIGHT : undefined }}
      >
        <div
          ref={canvasRef}
          className="relative mx-auto h-full max-w-[1440px]"
          style={{ transform: `scale(${fit})`, transformOrigin: `50% ${centreY}` }}
        >
          {card ? (
            <>
              {satellites.map((slot, i) => (
                <Anchored key={`${topId}-${i}`} box={slot} centreY={centreY}>
                  <motion.div
                    className="size-full"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: slot.x * offsetScale,
                      y: slot.y * offsetScale,
                    }}
                    transition={{ ...transition, delay: prefersReducedMotion ? 0 : i * 0.1 }}
                  >
                    <Satellite thumb={top.thumbnails[i]} flipEnabled={flipEnabled} />
                  </motion.div>
                </Anchored>
              ))}

              {slides.map((slide) => {
                const depth = order.indexOf(slide.id);
                const isTop = depth === 0;
                // Cards deeper than the stack are parked at its last position
                // rather than left at full size behind an opacity of 0. Left at
                // full size they had to travel the whole way in as they became
                // visible, which showed as a card growing out of nothing at the
                // back of the deck.
                const behind =
                  depth === 0 ? undefined : (STACK[depth - 1] ?? STACK[STACK.length - 1]);

                return (
                  // The stacking order belongs on the positioned element. On
                  // the inner one it only competes inside its own wrapper, so
                  // every buried card painted over the featured one by DOM
                  // order regardless of the number.
                  <Anchored
                    key={slide.id}
                    box={card}
                    centreY={centreY}
                    zIndex={isTop ? 20 : 5 - depth}
                  >
                    <motion.div
                      animate={{
                        x: (behind?.x ?? 0) * offsetScale,
                        y: (behind?.y ?? 0) * offsetScale,
                        scale: behind?.scale ?? 1,
                        // A card deeper than the stack has nowhere to be shown.
                        opacity: isTop ? 1 : 0.95,
                      }}
                      transition={isTop ? transition : outTransition}
                      className={isTop ? undefined : 'pointer-events-none'}
                    >
                      <FeaturedCard
                        slide={slide}
                        isTop={isTop}
                        card={card}
                        imageSize={imageSize}
                        onAdvance={() => goTo((index + 1) % slides.length)}
                      />
                    </motion.div>
                  </Anchored>
                );
              })}
            </>
          ) : null}
        </div>
      </div>

      <div className="py-lg shrink-0">
        <ScrubbedTabs
          tabs={slides.map((slide) => ({ id: slide.id, label: slide.category }))}
          index={index}
          onSelect={goTo}
          progress={prefersReducedMotion ? undefined : scrollYProgress}
          ariaLabel={tablistLabel}
        />
      </div>
    </div>
  );

  if (prefersReducedMotion) return board;

  return (
    <div ref={trackRef} style={{ height: `${100 + steps * STEP_VH * 100}vh` }}>
      {board}
    </div>
  );
}

/**
 * Puts a box's centre on the composition's centre without using a transform.
 *
 * Negative margins rather than `translate(-50%, -50%)`, because the transform
 * belongs to the animation. Two transform sources on one element means one of
 * them wins, and the symptom is a card that jumps to a corner the instant it
 * starts moving.
 */
function Anchored({
  box,
  centreY,
  zIndex,
  children,
}: {
  box: { width: number; height: number };
  centreY: string;
  zIndex?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute left-1/2"
      style={{
        top: centreY,
        zIndex,
        width: box.width,
        height: box.height,
        marginLeft: -box.width / 2,
        marginTop: -box.height / 2,
      }}
    >
      {children}
    </div>
  );
}

function FeaturedCard({
  slide,
  isTop,
  card,
  imageSize,
  onAdvance,
}: {
  slide: StackSlide;
  isTop: boolean;
  card: { width: number; height: number };
  imageSize: number;
  onAdvance: () => void;
}) {
  const face = (
    // A hairline and a 2px lift, per the brief. Anything heavier and the card
    // stops reading as something printed and starts reading as a dialog
    // floating above the page.
    <div
      className="relative bg-white p-2.5 pl-7"
      style={{ width: card.width, height: card.height, ...CHROME }}
    >
      {isTop && (
        <span
          aria-hidden="true"
          className="text-caption text-text-subtle absolute top-1/2 left-1.5 -translate-y-1/2 rotate-180 tracking-widest uppercase [writing-mode:vertical-rl]"
        >
          Forese
        </span>
      )}

      <div
        className="bg-line-grid mx-auto overflow-hidden rounded-[9px]"
        style={{ width: imageSize, height: imageSize }}
      >
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

      <div className="px-3 pt-3.5 pb-3.5 text-left">
        {/* Editorial rather than geometric. The serif at 40/0.95 with tight
            tracking is what makes this a project card and not a UI panel. */}
        <h3
          className="font-serif"
          style={{ fontSize: 40, lineHeight: 0.95, fontWeight: 400, letterSpacing: '-1.8px' }}
        >
          {slide.category}
        </h3>
        <p
          className="text-text-muted"
          style={{ fontSize: 15, lineHeight: 1.18, fontWeight: 400, maxWidth: 380, marginTop: 8 }}
        >
          {slide.description}
        </p>
      </div>
    </div>
  );

  if (!isTop) {
    return (
      <div aria-hidden="true" className="pointer-events-none">
        {face}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdvance}
      className="focus-visible:ring-accent block rounded-[12px] text-left focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {face}
      <span className="sr-only">
        {slide.category}. {slide.description} Show the next project.
      </span>
    </button>
  );
}

/**
 * One labelled preview, which turns over to show its line.
 *
 * A button, so the flip is reachable three ways: hover on a fine pointer, focus
 * from a keyboard, and a tap where hover does not exist. A tap is safe here in
 * a way it would not be on the featured card, because a preview has no second
 * job to be confused with.
 */
function Satellite({ thumb, flipEnabled }: { thumb: StackThumb; flipEnabled: boolean }) {
  const [flipped, setFlipped] = useState(false);

  const faceBase = 'absolute inset-0 overflow-hidden bg-white p-1.5 [backface-visibility:hidden]';

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      onPointerEnter={() => flipEnabled && setFlipped(true)}
      onPointerLeave={() => flipEnabled && setFlipped(false)}
      onFocus={() => flipEnabled && setFlipped(true)}
      onBlur={() => setFlipped(false)}
      className="focus-visible:ring-accent block size-full rounded-[12px] focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ perspective: 900 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: MOVE.ease }}
        className="relative size-full [transform-style:preserve-3d]"
      >
        <div className={faceBase} style={CHROME}>
          <div className="bg-line-grid size-full overflow-hidden rounded-[9px]">
            {thumb.image && (
              <img
                src={thumb.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            )}
          </div>
          <span className="bg-accent text-accent-fg text-caption absolute top-3 left-1/2 -translate-x-1/2 rounded-sm px-2 py-0.5 whitespace-nowrap">
            {thumb.tag}
          </span>
        </div>

        <div
          aria-hidden="true"
          className={cn(faceBase, '[transform:rotateY(180deg)]')}
          style={CHROME}
        >
          <div className="flex size-full items-center justify-center p-2 text-center">
            <p className="text-caption text-balance">{thumb.flipText}</p>
          </div>
        </div>
      </motion.div>

      <span className="sr-only">
        {thumb.tag}. {thumb.flipText}
      </span>
    </button>
  );
}
