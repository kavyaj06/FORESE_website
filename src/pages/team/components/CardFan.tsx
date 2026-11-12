import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface FanCard {
  /** Stable, unique identifier. */
  id: string;
  /** The heading beside the fan while this card is up. */
  title: string;
  /**
   * The card's accessible name, when the heading is not enough on its own.
   *
   * A post card reads "General Secretary" beside the fan, which says nothing
   * about what pressing it does; its button says "General Secretary, show 6
   * people" instead.
   */
  label?: string;
  /** The line under the title while this card is up. */
  meta?: string;
  /** The card's face. A portrait, usually. */
  face: ReactNode;
}

interface CardFanProps {
  cards: readonly FanCard[];
  activeId?: string;
  defaultActiveId?: string;
  onSelect?: (card: FanCard) => void;
  /**
   * Fired for every click, including one on the card already raised.
   *
   * `onSelect` cannot do this job: it only fires when the raised card
   * changes, so the card sitting at the front of the hand could never be
   * opened — the first post in a rank would have been unreachable.
   *
   * Given, a click opens whatever it lands on rather than raising it for a
   * second click. One press, one answer.
   */
  onOpen?: (card: FanCard) => void;
  /** Card width in pixels. Height follows 5:7. Shrinks to fit a narrow column. */
  cardWidth?: number;
  /** Sits under the text beside the fan. The way back, at the second level. */
  aside?: ReactNode;
  className?: string;
}

/** Flick speed, in px/s, that picks a card however far it actually travelled. */
const SELECT_VELOCITY = -600;

/** Cards waiting in the hand sit behind the raised one, so they ride smaller. */
const HAND_SCALE = 0.72;

/**
 * Spread each card into a symmetric arc around the middle of the hand.
 *
 * The sweep is constant rather than the step, so a bigger hand fans tighter
 * instead of running off the sides of the column.
 */
function fanTransform(index: number, count: number, spacing: number) {
  const offset = index - (count - 1) / 2;
  const stepDeg = count > 1 ? Math.min(9, 46 / (count - 1)) : 0;
  const rotate = offset * stepDeg;

  return { rotate, x: offset * spacing, y: Math.abs(rotate) * 1.9 };
}

/**
 * A hand of cards, fanned, one of them raised.
 *
 * Ported from the implementation the club chose rather than written from
 * scratch: the arc, the two-layer hover and the flick-to-pick are the parts
 * they picked it for, and they are kept close to the original. What changed is
 * everything that assumed a different project — `motion/react` for this repo's
 * `framer-motion`, shadcn's colour names for this site's tokens, and a bespoke
 * focus ring for the one `base.css` already draws on every focusable thing.
 *
 * It does not know what it is showing. It takes faces, a name and a line of
 * text, so the same component fans posts at one level and people at the next.
 *
 * **It assumes motion is wanted.** There is no reduced-motion branch in here,
 * because on this site reduced motion has to change the tree rather than the
 * timing: the caller renders the ordinary grid instead and never mounts this.
 */
export function CardFan({
  cards,
  activeId: controlledActiveId,
  defaultActiveId,
  onSelect,
  onOpen,
  cardWidth = 224,
  aside,
  className,
}: CardFanProps) {
  const fanRef = useRef<HTMLDivElement>(null);
  // Set while a pointer drag is in flight, so the click that trails it is
  // ignored and a drag never counts twice.
  const draggingRef = useRef(false);
  const [fanWidth, setFanWidth] = useState<number | null>(null);
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId ?? cards[0]?.id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Dragging a card claims the vertical touch axis, which on a phone means
  // swiping over the fan scrolls nothing. Pointer devices only — the same
  // gate `Tilt3D` uses.
  const [canDrag, setCanDrag] = useState(false);

  // Fall back to the first card whenever the asked-for id is not in the hand:
  // a swapped list, a stale controlled id, a bad default. Without this the fan
  // has nothing raised and no text beside it, which is otherwise unreachable.
  const requestedId = controlledActiveId ?? internalActiveId;
  const activeId = cards.some((card) => card.id === requestedId) ? requestedId : cards[0]?.id;
  const activeIndex = cards.findIndex((card) => card.id === activeId);
  const activeCard = cards[activeIndex];

  useEffect(() => {
    setCanDrag(!window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    const node = fanRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => setFanWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Cards shrink rather than overflow once the column gets narrow.
  const width = fanWidth === null ? cardWidth : Math.min(cardWidth, fanWidth * 0.55);

  // Every distance below scales off the card, so the hand holds together at
  // any width instead of only at the default one.
  const height = width * 1.4;
  const baseBottom = height * 0.09;
  const hoverLift = height * 0.34;
  const activeLift = height * 0.62;
  const selectDistance = -height * 0.5;

  const handCards = cards.filter((card) => card.id !== activeId);
  const hoveredIndex = hoveredId ? handCards.findIndex((card) => card.id === hoveredId) : -1;

  // Clamp the spread so the outermost cards, hover scale included, never clip
  // against the edges of the column.
  const maxOffset = (handCards.length - 1) / 2;
  const halfAvailable = fanWidth === null ? Number.POSITIVE_INFINITY : fanWidth / 2 - width * 0.45;
  const fanSpacing =
    maxOffset > 0
      ? Math.min(
          width * (handCards.length > 5 ? 0.43 : 0.52),
          Math.max(width * 0.23, halfAvailable / maxOffset),
        )
      : 0;

  const cardTransition = { damping: 30, mass: 0.9, stiffness: 340, type: 'spring' as const };

  function clearHover(id: string) {
    setHoveredId((current) => (current === id ? null : current));
  }

  function selectCard(card: FanCard) {
    if (card.id === activeId) return;
    clearHover(card.id);
    if (controlledActiveId === undefined) setInternalActiveId(card.id);
    onSelect?.(card);
  }

  /** Raise the card, then hand it to whoever wants to open it. */
  function pick(card: FanCard) {
    selectCard(card);
    onOpen?.(card);
  }

  return (
    <div
      className={cn(
        'gap-xl desktop:gap-2xl tablet:flex-row flex w-full flex-col items-center',
        className,
      )}
    >
      <div className="tablet:w-44 desktop:w-56 tablet:text-right w-full shrink-0 text-center">
        {activeCard && (
          <motion.div
            key={activeCard.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
          >
            <p className="text-eyebrow text-accent tabular-nums">
              {String(activeIndex + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
            </p>
            <h3 className="text-h3 mt-xs text-balance">{activeCard.title}</h3>
          </motion.div>
        )}
      </div>

      <div
        ref={fanRef}
        className="relative w-full min-w-0 flex-1"
        style={{ minHeight: height * 1.78 }}
      >
        {cards.map((card) => {
          const isActive = card.id === activeId;
          const handIndex = handCards.findIndex((candidate) => candidate.id === card.id);

          // Two layers. The outer one holds the card's resting slot and never
          // moves on hover; the inner one carries the lift. Hover is tracked
          // on the outer layer, so its hit area is the slot plus the raised
          // card — tracking the moving card alone let it slide out from under
          // the cursor, drop back, re-hover and flicker.
          let slot: { rotate: number; scale: number; x: number; y: number };
          let lift = { rotate: 0, scale: 1, x: 0, y: 0 };
          let zIndex: number;

          if (isActive) {
            slot = { rotate: 0, scale: 1, x: 0, y: -activeLift };
            // Under the sticky header at 50 and the column rules at 30.
            zIndex = 25;
          } else {
            const fan = fanTransform(handIndex, handCards.length, fanSpacing);
            const isHovered = card.id === hoveredId;
            // Neighbours step aside, and the push falls off with distance.
            const neighborShift =
              hoveredIndex !== -1 && !isHovered
                ? (Math.sign(handIndex - hoveredIndex) * width * 0.14) /
                  Math.max(1, Math.abs(handIndex - hoveredIndex))
                : 0;
            const dx = neighborShift;
            // Lift to a constant height, so a hovered card clears the bottom
            // edge however far it droops along the arc.
            const dy = isHovered ? -hoverLift - fan.y : 0;
            // The inner layer lives in the slot's rotated, scaled frame, so
            // the screen-space offset has to be mapped back into it.
            const rad = (-fan.rotate * Math.PI) / 180;

            slot = { rotate: fan.rotate, scale: HAND_SCALE, x: fan.x, y: fan.y };
            lift = {
              rotate: isHovered ? -fan.rotate * 0.45 : 0,
              scale: isHovered ? 1.08 : 1,
              x: (dx * Math.cos(rad) - dy * Math.sin(rad)) / HAND_SCALE,
              y: (dx * Math.sin(rad) + dy * Math.cos(rad)) / HAND_SCALE,
            };
            zIndex = isHovered ? 20 : 10 + handIndex;
          }

          return (
            <motion.div
              key={card.id}
              className="absolute left-1/2"
              initial={false}
              animate={slot}
              transition={cardTransition}
              onHoverEnd={() => clearHover(card.id)}
              onHoverStart={() => {
                if (!isActive) setHoveredId(card.id);
              }}
              style={{ bottom: baseBottom, marginLeft: -width / 2, zIndex }}
            >
              <motion.div initial={false} animate={lift} transition={cardTransition}>
                <motion.button
                  type="button"
                  aria-label={card.label ?? card.title}
                  // Only a toggle when pressing it just raises a card. Where
                  // a press opens the hand behind it, "pressed" would describe
                  // the wrong thing.
                  aria-pressed={onOpen ? undefined : isActive}
                  className={cn(
                    'block rounded-lg',
                    isActive && !onOpen && 'cursor-default',
                    isActive && onOpen && 'cursor-pointer',
                    !isActive && 'cursor-grab active:cursor-grabbing',
                  )}
                  drag={canDrag && !isActive ? 'y' : false}
                  dragConstraints={{ bottom: 0, top: -height * 1.65 }}
                  dragElastic={0.12}
                  dragSnapToOrigin
                  onBlur={() => clearHover(card.id)}
                  onFocus={() => {
                    if (!isActive) setHoveredId(card.id);
                  }}
                  onPointerDown={() => {
                    draggingRef.current = false;
                  }}
                  onDragStart={() => {
                    draggingRef.current = true;
                  }}
                  onDragEnd={(_event, info) => {
                    if (info.offset.y < selectDistance || info.velocity.y < SELECT_VELOCITY) {
                      pick(card);
                    }
                  }}
                  // Enter and Space reach this natively. A drag never does: the
                  // pointer sequence sets the flag before the click lands.
                  onClick={() => {
                    if (draggingRef.current) {
                      draggingRef.current = false;
                      return;
                    }
                    pick(card);
                  }}
                >
                  <span
                    className="border-border bg-surface block aspect-[5/7] overflow-hidden rounded-lg border shadow-lg select-none"
                    style={{ width }}
                  >
                    {card.face}
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div
        aria-live="polite"
        className="gap-md tablet:w-44 desktop:w-56 tablet:text-left flex w-full shrink-0 flex-col text-center"
      >
        {activeCard?.meta && (
          <motion.p
            key={activeCard.id}
            className="text-small text-text-muted text-pretty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
          >
            {activeCard.meta}
          </motion.p>
        )}
        {aside}
      </div>
    </div>
  );
}
