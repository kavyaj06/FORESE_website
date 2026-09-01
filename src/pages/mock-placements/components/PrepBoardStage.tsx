import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { GalleryPhoto } from '@/pages/gallery/data';
import type { BoardSlot, PrepTopic } from '../data';

interface PrepBoardStageProps {
  topic: PrepTopic;
  slots: BoardSlot[];
  cover?: GalleryPhoto;
  thumbs: GalleryPhoto[];
}

/** Offsets of the card edges peeking above the centre card, as % of its height. */
const STACK = [
  { y: -4, scale: 0.96 },
  { y: -7.5, scale: 0.92 },
  { y: -10.5, scale: 0.88 },
];

/**
 * The board itself: a centre card on a small stack of card edges, four labelled
 * thumbnails scattered around it, on a dot grid.
 *
 * **The stage is a fixed aspect box, and everything inside it is a percentage
 * of that box.** This is the load-bearing decision. Because 16/9 holds at every
 * desktop width, a position proved not to collide once cannot collide at any
 * other width — the whole layout is one affine scale of itself. The alternative,
 * pixel offsets at breakpoints, needs re-proving at each one.
 *
 * The stage is bounded by the viewport rather than by `max-w-content`, which
 * has a 1200px floor and has already put absolutely-positioned decoration
 * underneath page content once on this site.
 *
 * 16/9 rather than the 16/7 this started at, and the centre card's picture is
 * 4/3 rather than 4/5. At the taller card and shorter box the card did not fit
 * its own stage: the last line of every description was cut off by the stage's
 * `overflow-hidden`. A board whose centre card does not fit is not a
 * proportion to taste, it is a bug.
 *
 * **Three nested nodes per card, and they cannot be collapsed.** The outer one
 * owns `layout`, so framer FLIPs it to its new slot when the topic changes; the
 * middle one owns the pointer parallax; the inner one owns the rotation. Framer's
 * FLIP and a hand-written transform on the same element fight each other, and
 * the symptom is cards that drift and never settle.
 *
 * **No `AnimatePresence`.** Its exit callback has already failed to fire in a
 * production build of this site and white-screened every page. Nothing here
 * waits on an exit: the centre card is keyed and fades in over the stack edges,
 * which are always painted, so no frame is ever empty.
 */
export function PrepBoardStage({ topic, slots, cover, thumbs }: PrepBoardStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const parallax = fine && !prefersReducedMotion;

  // Pointer position as −0.5…0.5 of the stage, in motion values so a mouse
  // move never re-renders anything.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const onPointerMove = (event: React.PointerEvent) => {
    if (!parallax) return;
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    px.set((event.clientX - box.left) / box.width - 0.5);
    py.set((event.clientY - box.top) / box.height - 0.5);
  };

  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className="bg-dot-grid mask-radial-fade relative isolate mx-auto aspect-[16/9] w-full max-w-[76rem] overflow-hidden"
    >
      {slots.map((slot, index) => (
        <Drift key={index} slot={slot} px={px} py={py}>
          <ScatterCard photo={thumbs[index]} label={topic.chips[index]} rotate={slot.rotate} />
        </Drift>
      ))}

      {/* Centre card, with the stack showing above it. */}
      <Drift
        slot={{ x: 50, y: 47, rotate: 0, depth: 5 }}
        px={px}
        py={py}
        className="w-[24%]"
        layout={false}
      >
        <div className="relative">
          {STACK.map((edge, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="bg-surface-raised border-border absolute inset-0 rounded-lg border"
              style={{
                transform: `translateY(${edge.y}%) scale(${edge.scale})`,
                zIndex: -1 - i,
              }}
            />
          ))}

          <motion.article
            key={topic.id}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: EASE_OUT_BRAND }}
            className="bg-surface-raised border-border relative rounded-lg border p-2 shadow-lg"
          >
            <div className="bg-line-grid aspect-[4/3] w-full overflow-hidden rounded-md">
              {cover?.src && (
                <img
                  src={cover.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              )}
            </div>
            <div className="p-sm">
              <h3 className="text-h3">{topic.title}</h3>
              <p className="text-small text-text-muted mt-xs">{topic.body}</p>
            </div>
          </motion.article>
        </div>
      </Drift>
    </div>
  );
}

/**
 * The parallax layer. Split out because every card needs its own springs, and
 * hooks cannot be called in a loop inside the parent.
 */
function Drift({
  slot,
  px,
  py,
  children,
  className,
  layout = true,
}: {
  slot: BoardSlot;
  px: MotionValue<number>;
  py: MotionValue<number>;
  children: ReactNode;
  className?: string;
  layout?: boolean;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const spring = { stiffness: 150, damping: 24, mass: 0.5 };

  // Inverted, so cards drift against the cursor rather than following it.
  const x = useSpring(useTransform(px, [-0.5, 0.5], [slot.depth, -slot.depth]), spring);
  const y = useSpring(useTransform(py, [-0.5, 0.5], [slot.depth * 0.6, -slot.depth * 0.6]), spring);

  return (
    <motion.div
      layout={layout && !prefersReducedMotion}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${className ?? 'w-[13%]'}`}
    >
      <motion.div style={{ x, y }}>{children}</motion.div>
    </motion.div>
  );
}

function ScatterCard({
  photo,
  label,
  rotate,
}: {
  photo?: GalleryPhoto;
  label: string;
  rotate: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="duration-slow ease-out-brand transition-transform"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="bg-surface-raised border-border relative rounded-lg border p-1.5 shadow-md">
        <div className="bg-line-grid aspect-[4/3] w-full overflow-hidden rounded-sm">
          {photo?.src && (
            <img
              src={photo.src}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          )}
        </div>
        {/* The label sits on the picture, as in the reference. `text-caption`
            because at 13% of the stage these cards are around 150px wide. */}
        <span className="bg-accent text-accent-fg text-caption absolute top-3 left-1/2 -translate-x-1/2 rounded-sm px-2 py-0.5 whitespace-nowrap">
          {label}
        </span>
      </div>
    </div>
  );
}
