import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import type { FanCard } from './CardFan';

interface CardDealProps {
  cards: readonly FanCard[];
  /** Which card is raised. `null` raises none of them. */
  activeId: string | null;
  onPick: (card: FanCard) => void;
  /**
   * Where the deck sits before the deal, in px below the bottom of this row.
   *
   * The posting cards, so the people come up out of the posting that was
   * picked rather than out of thin air.
   */
  deckBelow: number;
  /**
   * How many cards the size is worked out for — the biggest posting in the
   * rank, not this one. Sized per posting, a pair got 200px cards and six got
   * 86px, so the same people looked different depending on who they shared a
   * posting with.
   */
  slots: number;
  className?: string;
}

/** Widest a card gets, for postings with only one or two people. */
const MAX_WIDTH = 200;
const RATIO = 1.34;
const GAP = 12;
/** Below this the row of six would be thumbnails, so it wraps into threes. */
const NARROW = 480;
/** How long the cards sit as a held deck before they are dealt. */
const HOLD = 0.15;

const spring = { damping: 24, stiffness: 260, type: 'spring' as const };

/**
 * A posting's people, dealt out of one deck into a row of separate cards.
 *
 * The club asked for this in place of the fan: it should look like dealing to
 * players. Every card starts stacked at the posting, held there a beat, then
 * all of them leave together and land side by side, square, none overlapping.
 * All at once, not one by one — the club tried the idea of a staggered deal
 * and chose the simultaneous one.
 *
 * Transform-only, like everything that moves on this site: the cards are
 * absolutely placed and the row has a fixed height worked out from the count,
 * so the page never reflows during the deal.
 *
 * No reduced-motion branch, for the same reason as `CardFan`: `TeamBrowser`
 * renders plain rows instead and never mounts this.
 */
export function CardDeal({ cards, activeId, onPick, deckBelow, slots, className }: CardDealProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowWidth, setRowWidth] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // The hold is a delay on the transition, and framer uses one transition for
  // everything a card animates — left in, it would also slow every hover.
  const [dealt, setDealt] = useState(false);

  useEffect(() => {
    const node = rowRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setRowWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDealt(true), (HOLD + 0.6) * 1000);
    return () => clearTimeout(timer);
  }, []);

  const n = cards.length;
  const available = rowWidth ?? 0;
  const fit = Math.max(n, slots);
  const sizeColumns = available < NARROW ? Math.min(fit, 3) : fit;
  const columns = Math.min(n, sizeColumns);
  const rows = Math.ceil(n / columns);
  const width = Math.max(
    0,
    Math.min(MAX_WIDTH, (available - (sizeColumns - 1) * GAP) / sizeColumns),
  );
  const height = width * RATIO;
  const rowHeight = rows * height + (rows - 1) * GAP;

  return (
    <div
      ref={rowRef}
      className={cn('relative w-full min-w-0', className)}
      style={{ height: rowHeight }}
    >
      {/* Nothing is placed until the row has been measured: placed against a
          guessed width, the deal would start from the wrong spot and jump. */}
      {rowWidth !== null &&
        cards.map((card, index) => {
          const row = Math.floor(index / columns);
          const inRow = Math.min(columns, n - row * columns);
          const col = index - row * columns;
          const rowSpan = inRow * width + (inRow - 1) * GAP;
          const x = (available - rowSpan) / 2 + col * (width + GAP);
          const y = row * (height + GAP);

          const isActive = card.id === activeId;
          const isHovered = card.id === hoveredId;
          const raise = isActive ? -12 : isHovered ? -8 : 0;

          // A slightly untidy deck, so it reads as a pile of cards and not as
          // one card. Fixed per position, so it is the same pile every time.
          const tilt = ((index % 3) - 1) * 3;

          return (
            <motion.div
              key={card.id}
              className="absolute top-0 left-0"
              initial={{
                x: (available - width) / 2,
                y: rowHeight + deckBelow - height / 2,
                rotate: tilt,
                scale: 0.7,
              }}
              animate={{ x, y: y + raise, rotate: 0, scale: isHovered ? 1.04 : 1 }}
              transition={{ ...spring, delay: dealt ? 0 : HOLD }}
              onHoverStart={() => setHoveredId(card.id)}
              onHoverEnd={() => setHoveredId((c) => (c === card.id ? null : c))}
              style={{ zIndex: isActive ? 3 : isHovered ? 2 : 1 }}
            >
              <button
                type="button"
                aria-label={card.label}
                onClick={() => onPick(card)}
                onFocus={() => setHoveredId(card.id)}
                onBlur={() => setHoveredId((c) => (c === card.id ? null : c))}
                className="block cursor-pointer rounded-lg"
              >
                <span
                  data-theme="inverse"
                  // Same as `CardFan`: keeps the page's column rules off the
                  // dark face.
                  data-rules="off"
                  className={cn(
                    'duration-base ease-out-brand block overflow-hidden rounded-lg border transition-colors',
                    isActive ? 'border-accent shadow-lit' : 'border-border shadow-md',
                  )}
                  style={{ width, height }}
                >
                  {card.face}
                </span>
              </button>
            </motion.div>
          );
        })}
    </div>
  );
}
