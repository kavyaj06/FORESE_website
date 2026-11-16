import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import type { FanCard } from './CardFan';

interface CardDealProps {
  cards: readonly FanCard[];
  /** Which card is raised. `null` raises none of them. */
  activeId: string | null;
  onPick: (card: FanCard) => void;
  /** Card width in px. Worked out by the caller, the same for every posting. */
  cardWidth: number;
  /** Cards per row. */
  columns: number;
  /** The grid's own box. Rows are centred in it vertically and horizontally. */
  width: number;
  height: number;
  /**
   * Where the deck is, in px from this grid's top-left corner — the middle of
   * the posting cards, so the people are dealt out of the posting that was
   * picked rather than out of thin air. Negative `x` when the deck is to the
   * left of the grid, which it is on wide screens.
   */
  origin: { x: number; y: number };
  className?: string;
}

/** Card height as a multiple of its width. */
export const DEAL_RATIO = 1.34;
/** Space between cards, both ways. */
export const DEAL_GAP = 12;
/** How long the cards sit as a held deck before they are dealt. */
const HOLD = 0.15;

const spring = { damping: 24, stiffness: 260, type: 'spring' as const };

/**
 * A posting's people, dealt out of one deck into a grid of separate cards.
 *
 * The club asked for this in place of the fan: it should look like dealing to
 * players. Every card starts stacked at the posting deck, held there a beat,
 * then all of them leave together and land in their own places, square, none
 * overlapping. All at once, not one by one — the club chose the simultaneous
 * deal over a staggered one.
 *
 * It does no measuring of its own. `CoreFan` sizes the deck and this grid
 * together, because where one goes decides how much room the other has.
 *
 * Transform-only, like everything that moves on this site. No reduced-motion
 * branch, for the same reason as `CardFan`: `TeamBrowser` renders plain rows
 * instead and never mounts this.
 */
export function CardDeal({
  cards,
  activeId,
  onPick,
  cardWidth,
  columns,
  width,
  height,
  origin,
  className,
}: CardDealProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // The hold is a delay on the transition, and framer uses one transition for
  // everything a card animates — left in, it would also slow every hover.
  const [dealt, setDealt] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDealt(true), (HOLD + 0.6) * 1000);
    return () => clearTimeout(timer);
  }, []);

  const n = cards.length;
  const cols = Math.max(1, Math.min(n, columns));
  const rows = Math.ceil(n / cols);
  const cardHeight = cardWidth * DEAL_RATIO;
  const used = rows * cardHeight + (rows - 1) * DEAL_GAP;
  const top = (height - used) / 2;

  return (
    <div className={cn('relative', className)} style={{ width, height }}>
      {cards.map((card, index) => {
        const row = Math.floor(index / cols);
        const inRow = Math.min(cols, n - row * cols);
        const col = index - row * cols;
        const rowSpan = inRow * cardWidth + (inRow - 1) * DEAL_GAP;
        const x = (width - rowSpan) / 2 + col * (cardWidth + DEAL_GAP);
        const y = top + row * (cardHeight + DEAL_GAP);

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
              x: origin.x - cardWidth / 2,
              y: origin.y - cardHeight / 2,
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
                style={{ width: cardWidth, height: cardHeight }}
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
