import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface FanCard {
  /** Stable, unique identifier. */
  id: string;
  /** The card's accessible name. */
  label: string;
  /** What is printed on the card. */
  face: ReactNode;
}

interface CardFanProps {
  cards: readonly FanCard[];
  /** Which card is at the front. `null` raises none of them. */
  activeId: string | null;
  onPick: (card: FanCard) => void;
  /** Card width in pixels. Shrinks to fit a narrow column. */
  cardWidth?: number;
  /** Card height as a multiple of its width. */
  ratio?: number;
  /**
   * How far the front card rises, as a fraction of card height.
   *
   * Not a taste setting. The raised card centres over the gap it left in the
   * hand, so it sits directly above its neighbours — at a small lift it
   * covers them and takes their clicks, and with an odd-sized hand it buries
   * the middle card completely. It has to clear them.
   */
  lift?: number;
  /** Degrees between neighbouring cards, before the sweep clamp. */
  step?: number;
  /**
   * Deal the hand out of a pile at the centre when it first mounts.
   *
   * For the people: picking a posting should look like its cards being
   * spread, not like a row of them switching on. The postings themselves do
   * not want it — they are already on the page when you arrive, so there is
   * no pile for them to come out of.
   */
  spreadIn?: boolean;
  className?: string;
}

/** Flick speed, in px/s, that picks a card however far it actually travelled. */
const SELECT_VELOCITY = -600;

/** Cards waiting in the hand sit behind the raised one, so they ride smaller. */
const HAND_SCALE = 0.82;

/**
 * Spread each card into a symmetric arc around the middle of the hand.
 *
 * The sweep is constant rather than the step, so a bigger hand fans tighter
 * instead of running off the sides of the column.
 */
function fanTransform(index: number, count: number, spacing: number, step: number) {
  const offset = index - (count - 1) / 2;
  const stepDeg = count > 1 ? Math.min(step, (step * 5) / (count - 1)) : 0;
  const rotate = offset * stepDeg;

  return { rotate, x: offset * spacing, y: Math.abs(rotate) * 1.9 };
}

/**
 * A hand of cards, fanned, one of them at the front.
 *
 * Ported from the implementation the club chose: the arc, the two-layer hover
 * and the flick-to-pick are theirs and are kept close to the original. What
 * changed is everything that assumed a different project — `motion/react` for
 * this repo's `framer-motion`, shadcn's colour names for this site's tokens,
 * and a bespoke focus ring for the one `base.css` already draws.
 *
 * It knows nothing about what it is showing. It takes faces and hands back
 * clicks, so the same component fans the postings along the bottom of the
 * stage and the people in one of them across the top.
 *
 * Each card carries `data-theme="inverse"`, which is how this site makes
 * anything dark: the tokens re-map beneath it, so the face inside writes
 * `text-text` and `text-text-muted` as usual and comes out white and grey on
 * black. It also flips `--color-accent` to the bright orange, which is what
 * the front card's border and glow pick up.
 *
 * **It assumes motion is wanted.** There is no reduced-motion branch here,
 * because on this site reduced motion has to change the tree rather than the
 * timing: `TeamBrowser` renders the ordinary rows of cards instead and never
 * mounts this.
 */
export function CardFan({
  cards,
  activeId,
  onPick,
  cardWidth = 200,
  ratio = 1.3,
  lift = 0.1,
  step = 9,
  spreadIn = false,
  className,
}: CardFanProps) {
  const fanRef = useRef<HTMLDivElement>(null);
  // Set while a pointer drag is in flight, so the click that trails it is
  // ignored and one gesture never counts twice.
  const draggingRef = useRef(false);
  const [fanWidth, setFanWidth] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Dragging a card claims the vertical touch axis, which on a phone means
  // swiping over the fan scrolls nothing. Pointer devices only — the gate
  // `Tilt3D` already uses.
  const [canDrag, setCanDrag] = useState(false);
  /**
   * Whether the deal has finished.
   *
   * The stagger below is a delay on the card's transition, and framer uses
   * one transition for every animation a component runs — so left in place it
   * would also delay the hover lift and the raise, by up to a third of a
   * second on the outermost card. It is dropped once the hand is out.
   */
  const [dealt, setDealt] = useState(!spreadIn);

  useEffect(() => {
    setCanDrag(!window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (dealt) return;
    const timer = setTimeout(() => setDealt(true), 300 + cards.length * 60);
    return () => clearTimeout(timer);
  }, [dealt, cards.length]);

  useEffect(() => {
    const node = fanRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setFanWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /**
   * Cards shrink rather than overflow once the column gets narrow, and a
   * bigger hand shrinks further.
   *
   * The count has to be in here. At a fixed fraction of the column, six cards
   * on a 350px phone each wanted 161px, which no amount of tightening the arc
   * fits — it put 69px of the hand outside the page.
   */
  const width =
    fanWidth === null ? cardWidth : Math.min(cardWidth, fanWidth / (1.45 + cards.length * 0.16));
  const height = width * ratio;

  /**
   * Every card keeps its own place in the arc, the raised one included.
   *
   * The reference centres the card it raises, and that was tried first. It
   * cannot work here, measured rather than guessed: centred, the raised card
   * covered the middle of its neighbours and took their clicks, and with an
   * even number of postings — the junior core has four — the hand puts a card
   * at dead centre, directly behind the raised one, where no lift short of a
   * whole card height uncovers it.
   *
   * Holding the slot costs the reference's symmetry and buys two things: every
   * card stays clickable at its centre, and the hand does not rearrange itself
   * under the cursor each time a different posting is picked. Which card is
   * open is said by the lift, the glowing border and the rule under its name.
   */
  const hoveredIndex = hoveredId ? cards.findIndex((card) => card.id === hoveredId) : -1;

  // Clamp the spread so the outermost cards, hover scale included, never clip
  // against the edges of the column.
  const maxOffset = (cards.length - 1) / 2;
  const halfAvailable = fanWidth === null ? Number.POSITIVE_INFINITY : fanWidth / 2 - width * 0.52;
  /**
   * How far apart the cards sit.
   *
   * What the arc wants, or what the column can afford, whichever is smaller —
   * in that order, and with no floor under it. A floor was tried and is the
   * thing that put the hand off the side of a phone: it won against the fit,
   * which is the one of the two that is not negotiable.
   *
   * The wanted spacing is over half a card either way, so the card beside the
   * raised one keeps its own centre clear. Where the column cannot afford
   * even that, the cards overlap more and the arc still fits on the screen.
   */
  const spacing =
    maxOffset > 0
      ? Math.min(width * (cards.length > 5 ? 0.6 : 0.78), halfAvailable / maxOffset)
      : 0;

  const transition = { damping: 26, mass: 0.85, stiffness: 300, type: 'spring' as const };

  function clearHover(id: string) {
    setHoveredId((current) => (current === id ? null : current));
  }

  function pick(card: FanCard) {
    clearHover(card.id);
    onPick(card);
  }

  return (
    <div ref={fanRef} className={cn('relative w-full min-w-0', className)} style={{ height }}>
      {cards.map((card, index) => {
        const isActive = card.id === activeId;
        const isHovered = card.id === hoveredId;
        const fan = fanTransform(index, cards.length, spacing, step);

        // Two layers. The outer one holds the card's resting slot and never
        // moves on hover; the inner one carries the lift. Hover is tracked on
        // the outer layer, so its hit area is the slot plus the raised card —
        // tracking the moving card alone let it slide out from under the
        // cursor, drop back, re-hover and flicker.
        const slot = isActive
          ? { rotate: 0, scale: 1, x: fan.x, y: -height * lift }
          : { rotate: fan.rotate, scale: HAND_SCALE, x: fan.x, y: fan.y };

        // Neighbours step aside from a hovered card, and the push falls off
        // with distance.
        const neighbourShift =
          hoveredIndex !== -1 && !isHovered
            ? (Math.sign(index - hoveredIndex) * width * 0.12) /
              Math.max(1, Math.abs(index - hoveredIndex))
            : 0;
        const dy = isHovered && !isActive ? -height * 0.14 - fan.y : 0;
        // The inner layer lives in the slot's rotated, scaled frame, so the
        // screen-space offset has to be mapped back into it.
        const rad = (-slot.rotate * Math.PI) / 180;
        const lifted = {
          rotate: isHovered && !isActive ? -fan.rotate * 0.4 : 0,
          scale: isHovered ? 1.05 : 1,
          x: (neighbourShift * Math.cos(rad) - dy * Math.sin(rad)) / slot.scale,
          y: (neighbourShift * Math.sin(rad) + dy * Math.cos(rad)) / slot.scale,
        };

        // Dealt from the middle outwards, so the hand opens from its centre
        // rather than sweeping from one end.
        const fromCentre = Math.abs(index - (cards.length - 1) / 2);
        const delay = dealt ? 0 : fromCentre * 0.06;

        return (
          <motion.div
            key={card.id}
            className="absolute bottom-0 left-1/2"
            // The pile every card starts in: no offset, no angle, a little
            // small. `false` would plant each card in its finished slot,
            // which is the version that looked like the cards simply
            // appearing.
            initial={spreadIn ? { rotate: 0, scale: 0.7, x: 0, y: 0, opacity: 0 } : false}
            animate={{ ...slot, opacity: 1 }}
            transition={{ ...transition, delay }}
            onHoverStart={() => setHoveredId(card.id)}
            onHoverEnd={() => clearHover(card.id)}
            style={{
              marginLeft: -width / 2,
              // Under the sticky header at 50 and the column rules at 30.
              zIndex: isActive ? 25 : isHovered ? 20 : 10 + index,
            }}
          >
            <motion.div initial={false} animate={lifted} transition={transition}>
              <motion.button
                type="button"
                aria-label={card.label}
                className={cn('block rounded-lg', isActive ? 'cursor-pointer' : 'cursor-grab')}
                drag={canDrag && !isActive ? 'y' : false}
                dragConstraints={{ bottom: 0, top: -height }}
                dragElastic={0.12}
                dragSnapToOrigin
                onBlur={() => clearHover(card.id)}
                onFocus={() => setHoveredId(card.id)}
                onPointerDown={() => {
                  draggingRef.current = false;
                }}
                onDragStart={() => {
                  draggingRef.current = true;
                }}
                onDragEnd={(_event, info) => {
                  if (info.offset.y < -height * 0.4 || info.velocity.y < SELECT_VELOCITY) {
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
                  data-theme="inverse"
                  // The page's column rules are drawn on every element
                  // carrying the inverse theme, which is every dark band and,
                  // without this, every dark card. They were striping the
                  // faces. See the rules block in `theme.css`.
                  data-rules="off"
                  className={cn(
                    'duration-base ease-out-brand block overflow-hidden rounded-lg border transition-colors',
                    isActive ? 'border-accent shadow-lit' : 'border-border shadow-md',
                  )}
                  style={{ width, height }}
                >
                  {card.face}
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
