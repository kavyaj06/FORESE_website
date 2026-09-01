import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import { SegmentedTabs } from '@/components/sections/SegmentedTabs';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

export interface StackThumb {
  tag: string;
  /** Shown on the thumbnail's back when it is flipped. */
  flipText: string;
  image?: string;
}

export interface StackSlide {
  id: string;
  /** Tab label and the card's own category. */
  category: string;
  image?: string;
  description: string;
  /** Top-left, top-right, bottom-left, bottom-right. */
  thumbnails: [StackThumb, StackThumb, StackThumb, StackThumb];
}

interface CaseStudyStackProps {
  slides: StackSlide[];
  tablistLabel: string;
}

/**
 * Per depth: how far back a card sits, and how much it shrinks.
 *
 * `OFFSET_Y` is negative, and that is a deliberate reading of the brief rather
 * than an oversight. The brief asks for cards offset "down-and-back" with
 * "only its top edge/sliver visible", and those two cannot both be true: a
 * card pushed down shows its *bottom* edge. Offset upward, each buried card
 * shows a sliver of its top, which is the arrangement in the reference and the
 * one the brief describes in the half that is about what you see.
 *
 * Pushed down it was also invisible. Scaling from `origin-top` raises a card's
 * bottom edge by 5% of its height — about 22px here — which cancelled a 24px
 * downward offset almost exactly, and five cards rendered as one.
 */
const OFFSET_Y = -22;
const OFFSET_X = 6;
const SCALE_STEP = 0.05;

/** Where each satellite rests, as a percentage of the stage. Reading order. */
const CORNERS = [
  { x: 12, y: 16 },
  { x: 88, y: 14 },
  { x: 14, y: 82 },
  { x: 86, y: 80 },
] as const;

const CHANGE = { duration: 0.45, ease: EASE_OUT_BRAND };
const CROSSFADE = { duration: 0.35, ease: EASE_OUT_BRAND };
/** Between one satellite being dealt and the next. */
const DEAL_STAGGER = 0.1;

/**
 * A stack of cards that can be advanced two ways, and peeked at with a third.
 *
 * **The stack order is state, not markup.** `order` is a list of ids whose
 * first entry is the visible card; every card's depth is its index in that
 * list. Both ways of changing the active card are the same operation on it —
 * cutting the deck at some index — which is why a tab and the card itself can
 * never disagree about what is on top. A tab cuts at that slide; clicking the
 * card cuts at one.
 *
 * Cards are never re-created, only re-indexed, so framer animates each one from
 * where it was to where it now belongs. That is what makes the outgoing card
 * appear to travel to the back rather than blink out of existence — the motion
 * is a consequence of the data, not a separate script that has to be kept in
 * step with it.
 *
 * **`z-index` is animated rather than set.** Setting it on reorder puts the
 * outgoing card behind the deck on the first frame, so the whole journey
 * backwards happens out of sight and the change reads as a cut rather than a
 * card being placed. Animated, it passes behind its new neighbours in turn.
 *
 * **The flip belongs to the satellites, not to the card in the middle.** The
 * middle card is the thing you click to advance the deck; giving the same
 * element a hover that turns it over means the two gestures land on the same
 * target and the reader cannot tell which one they are about to get. The small
 * cards do nothing else, so a flip is theirs to spend.
 *
 * It reads no state and writes none: a preview that quietly changed which card
 * was active would be a trap. On a touchscreen there is no hover, so a tap on a
 * satellite flips it — which is safe precisely because a satellite has no other
 * job. Keyboard focus flips it too.
 *
 * Under `prefers-reduced-motion` every one of these becomes a crossfade: no
 * flip, no travel to the back, no dealing, no sliding pill.
 */
export function CaseStudyStack({ slides, tablistLabel }: CaseStudyStackProps) {
  const [order, setOrder] = useState<string[]>(() => slides.map((slide) => slide.id));

  const prefersReducedMotion = usePrefersReducedMotion();
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const isDesktop = useMediaQuery('(min-width: 64rem)');

  const flipEnabled = canHover && !prefersReducedMotion;

  /**
   * Cut the deck: everything from `index` moves to the front, keeping its
   * relative order, and everything before it goes to the back in its own. Both
   * interactions are this, and the flip is not.
   */
  const cutAt = useCallback((index: number) => {
    if (index <= 0) return;
    setOrder((current) => [...current.slice(index), ...current.slice(0, index)]);
  }, []);

  const topId = order[0];
  const top = slides.find((slide) => slide.id === topId) ?? slides[0];
  const depthOf = (id: string) => order.indexOf(id);

  return (
    <div className="relative">
      <div
        className={cn(
          'relative mx-auto w-full max-w-[76rem]',
          isDesktop ? 'aspect-[16/9]' : 'px-gutter py-xl',
        )}
      >
        {/* Satellites. Keyed by the active slide so they are dealt out fresh on
            every change rather than crossfading where they stand. */}
        {isDesktop &&
          top.thumbnails.map((thumb, i) => (
            <Satellite
              key={`${topId}-${i}`}
              thumb={thumb}
              corner={CORNERS[i]}
              index={i}
              reduced={prefersReducedMotion}
              flipEnabled={flipEnabled}
            />
          ))}

        <div
          className={cn(
            'relative mx-auto',
            isDesktop
              ? 'absolute top-1/2 left-1/2 w-[26%] -translate-x-1/2 -translate-y-1/2'
              : 'w-full',
          )}
          style={{ perspective: 1600 }}
        >
          {slides.map((slide) => {
            const depth = depthOf(slide.id);
            const isTop = depth === 0;

            return (
              <motion.div
                key={slide.id}
                animate={
                  prefersReducedMotion
                    ? { opacity: isTop ? 1 : 0, zIndex: slides.length - depth }
                    : {
                        y: depth * OFFSET_Y,
                        x: depth * OFFSET_X,
                        scale: 1 - depth * SCALE_STEP,
                        zIndex: slides.length - depth,
                        opacity: 1,
                      }
                }
                transition={prefersReducedMotion ? CROSSFADE : CHANGE}
                className={cn(
                  'origin-top',
                  isTop ? 'relative' : 'pointer-events-none absolute inset-0',
                )}
              >
                <Card slide={slide} isTop={isTop} onAdvance={() => cutAt(1)} />
              </motion.div>
            );
          })}
        </div>

        {/* On a phone the satellites cannot sit around the stack, so they sit
            under it — dealt out with the same stagger, never crossfaded. */}
        {!isDesktop && (
          <ul className="gap-sm mt-lg grid grid-cols-4">
            {top.thumbnails.map((thumb, i) => (
              <li key={`${topId}-${i}`}>
                <Satellite
                  thumb={thumb}
                  index={i}
                  reduced={prefersReducedMotion}
                  flipEnabled={flipEnabled}
                  inFlow
                />
              </li>
            ))}
          </ul>
        )}
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

function Card({
  slide,
  isTop,
  onAdvance,
}: {
  slide: StackSlide;
  isTop: boolean;
  onAdvance: () => void;
}) {
  // Buried cards render their real face, not a blank surface. Offset upward,
  // the sliver that shows is the top of the picture — which is what makes the
  // deck look like a deck of these cards rather than a stack of blank paper.
  const face = (
    <div className="bg-surface-raised border-border overflow-hidden rounded-lg border shadow-lg">
      <div className="bg-line-grid aspect-[4/3] w-full overflow-hidden">
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
      <div className="p-md text-left">
        <p className="text-eyebrow text-text-subtle uppercase">{slide.category}</p>
        <p className="text-small text-text-muted mt-xs">{slide.description}</p>
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
      className="focus-visible:ring-accent block w-full rounded-lg text-left focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {face}
      <span className="sr-only">
        {slide.category}. {slide.description} Show the next card.
      </span>
    </button>
  );
}

/**
 * One labelled thumbnail, which turns over to show its line.
 *
 * A `button` rather than a decorated div, because the flip has to be reachable
 * three ways: hover on a fine pointer, focus from the keyboard, and a tap on a
 * touchscreen where hover does not exist. A tap here is safe in a way a tap on
 * the centre card would not be — a satellite has no other job, so there is no
 * second gesture for it to be confused with.
 *
 * Both faces stay mounted and the back is `aria-hidden`; the line is announced
 * once through the button's own label instead, so a screen reader is not told
 * the same thing twice.
 */
function Satellite({
  thumb,
  corner,
  index,
  reduced,
  flipEnabled,
  inFlow = false,
}: {
  thumb: StackThumb;
  corner?: { x: number; y: number };
  index: number;
  reduced: boolean;
  flipEnabled: boolean;
  inFlow?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);

  const faceBase =
    'bg-surface-raised border-border absolute inset-0 overflow-hidden rounded-lg border p-1.5 shadow-md [backface-visibility:hidden]';

  const card = (
    <motion.div
      animate={{ rotateY: flipped && !reduced ? 180 : 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT_BRAND }}
      className="relative aspect-[4/3] w-full [transform-style:preserve-3d]"
    >
      <div className={faceBase}>
        <div className="bg-line-grid size-full overflow-hidden rounded-sm">
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

      <div aria-hidden="true" className={cn(faceBase, '[transform:rotateY(180deg)]')}>
        <div className="p-xs flex size-full items-center justify-center text-center">
          <p className="text-caption text-balance">{thumb.flipText}</p>
        </div>
      </div>
    </motion.div>
  );

  const content = (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      onPointerEnter={() => flipEnabled && setFlipped(true)}
      onPointerLeave={() => flipEnabled && setFlipped(false)}
      onFocus={() => flipEnabled && setFlipped(true)}
      onBlur={() => setFlipped(false)}
      className="focus-visible:ring-accent block w-full rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ perspective: 900 }}
    >
      {card}
      <span className="sr-only">
        {thumb.tag}. {thumb.flipText}
      </span>
    </button>
  );

  if (reduced) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={CROSSFADE}
        className={inFlow ? undefined : 'absolute w-[13%] -translate-x-1/2 -translate-y-1/2'}
        style={inFlow ? undefined : { left: `${corner?.x}%`, top: `${corner?.y}%` }}
      >
        {content}
      </motion.div>
    );
  }

  // Dealt from the middle of the stack outwards, one after another. The origin
  // is the point of it: appearing where they finish would read as a crossfade,
  // which is the one thing these must not do.
  return (
    <motion.div
      initial={
        inFlow
          ? { opacity: 0, scale: 0, y: -40 }
          : { opacity: 0, scale: 0, left: '50%', top: '50%' }
      }
      animate={
        inFlow
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 1, scale: 1, left: `${corner?.x}%`, top: `${corner?.y}%` }
      }
      transition={{ ...CHANGE, delay: index * DEAL_STAGGER }}
      className={inFlow ? undefined : 'absolute w-[13%] -translate-x-1/2 -translate-y-1/2'}
    >
      {content}
    </motion.div>
  );
}
