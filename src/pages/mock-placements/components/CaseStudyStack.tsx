import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SegmentedTabs } from '@/components/sections/SegmentedTabs';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
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

export interface StackThumb {
  tag: string;
  /** Shown on the preview's back when it is flipped. */
  flipText: string;
  image?: string;
}

export interface StackSlide {
  id: string;
  /** Tab label, and the card's own title. */
  category: string;
  image?: string;
  description: string;
  thumbnails: [StackThumb, StackThumb, StackThumb, StackThumb];
}

interface CaseStudyStackProps {
  slides: StackSlide[];
  tablistLabel: string;
}

/**
 * The card's shell, exactly as specified: a hairline, a 2px lift, and a 12px
 * corner.
 *
 * The radius is set here rather than with `rounded-xl` because this project
 * overrides Tailwind's radius scale — `rounded-xl` resolves to 24px, twice what
 * the brief asks for, and the difference is the whole distance between a
 * printed card and a soft UI panel.
 */
const CHROME = {
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  borderRadius: 12,
};

/**
 * A stack of project cards on a canvas, advanced two ways.
 *
 * **The stack order is state, not markup.** `order` is a list of ids whose
 * first entry is the featured card; a card's depth is its index in that list.
 * Both ways of changing the featured card are the same operation on it —
 * cutting the deck at an index — so a tab and the card itself can never
 * disagree about what is on top. A tab cuts at that slide; clicking the card
 * cuts at one.
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
  const [order, setOrder] = useState<string[]>(() => slides.map((slide) => slide.id));

  const prefersReducedMotion = usePrefersReducedMotion();
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const isDesktop = useMediaQuery('(min-width: 1200px)');
  const isTablet = useMediaQuery('(min-width: 768px)');

  const flipEnabled = canHover && !prefersReducedMotion;

  const cutAt = useCallback((index: number) => {
    if (index <= 0) return;
    setOrder((current) => [...current.slice(index), ...current.slice(0, index)]);
  }, []);

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

  return (
    <div>
      <div
        className="bg-board-canvas bg-board-dots relative [height:calc(100vh-145px)] overflow-hidden"
        style={{ minHeight: CANVAS_MIN_HEIGHT }}
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
                        onAdvance={() => cutAt(1)}
                      />
                    </motion.div>
                  </Anchored>
                );
              })}
            </>
          ) : (
            <MobileBoard
              top={top}
              onAdvance={() => cutAt(1)}
              flipEnabled={flipEnabled}
              satelliteCount={satelliteCount}
            />
          )}
        </div>
      </div>

      <div className="mt-xl flex justify-center">
        <SegmentedTabs
          tabs={slides.map((slide) => ({ id: slide.id, label: slide.category }))}
          value={topId}
          onChange={(id) => cutAt(order.indexOf(id))}
          layoutId="case-study-tab"
          ariaLabel={tablistLabel}
        />
      </div>
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

/**
 * Below 768px there is no composition to hold. The card sizes to the screen and
 * the previews sit under it in normal flow: absolute placement is dropped
 * entirely rather than scaled down, which is what keeps anything from
 * overflowing sideways at a width nobody measured.
 */
function MobileBoard({
  top,
  onAdvance,
  flipEnabled,
  satelliteCount,
}: {
  top: StackSlide;
  onAdvance: () => void;
  flipEnabled: boolean;
  satelliteCount: number;
}) {
  return (
    <div className="px-gutter flex h-full flex-col items-center justify-center">
      <button
        type="button"
        onClick={onAdvance}
        className="focus-visible:ring-accent block w-[min(88vw,360px)] rounded-[12px] text-left focus-visible:ring-2"
      >
        <div className="bg-white p-2.5" style={CHROME}>
          <div className="bg-line-grid mx-auto aspect-square w-[calc(100%-20px)] overflow-hidden rounded-[9px]">
            {top.image && (
              <img
                src={top.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            )}
          </div>
          <div className="px-3 pt-3.5 pb-3.5">
            <h3
              className="font-serif"
              style={{ fontSize: 32, lineHeight: 0.95, letterSpacing: '-1.2px' }}
            >
              {top.category}
            </h3>
            <p className="text-text-muted" style={{ fontSize: 15, lineHeight: 1.18, marginTop: 8 }}>
              {top.description}
            </p>
          </div>
        </div>
        <span className="sr-only">Show the next project.</span>
      </button>

      <ul className="gap-sm mt-lg flex justify-center">
        {top.thumbnails.slice(0, satelliteCount).map((thumb, i) => (
          <li key={i} className="size-[104px] shrink-0">
            <Satellite thumb={thumb} flipEnabled={flipEnabled} />
          </li>
        ))}
      </ul>
    </div>
  );
}
