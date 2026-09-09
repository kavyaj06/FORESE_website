import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { HOME_PILLAR_BAR } from '../data';

interface PillarBarProps {
  labels: string[];
  /** Which pillar is on screen. Owned by `Pillars`, derived from the scroll. */
  active: number;
  /** Whether the section has been scrolled far enough for the bar to open. */
  open: boolean;
  /** Scroll the reader to pillar `i`. The bar never sets the index itself. */
  onSelect: (index: number) => void;
}

/** How wide the bar is before it opens. */
const CLOSED_WIDTH = 232;

const OPEN_TRANSITION = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as const;

/**
 * A bar that opens into the five pillars as the section is scrolled.
 *
 * It starts closed: a narrow pill on the centre line saying only what it is.
 * Past a point in the section's travel it grows to the full width of the
 * column and slides left as it grows, and the five names arrive inside it one
 * after another. After that it is a tab strip, and the scroll lights each name
 * in turn as its pillar comes up.
 *
 * The shape is taken from the reference's prompt bar, which is the same move:
 * a small dark pill that becomes the wide control holding the sections. What
 * it does here is different, and worth being clear about — theirs types a
 * prompt, ours is a table of contents that assembles itself. The borrowed part
 * is the opening, not the pretence of an input.
 *
 * **Two states, not a scrub.** `open` is a boolean the parent flips at a
 * threshold, and the bar animates between two layouts. The alternative — width
 * and position driven continuously from scroll progress — would mean a bar
 * that is halfway open whenever the reader stops halfway, which is the
 * half-open-pill problem the mock placements strip already had once.
 *
 * **The width is animated, and it is the one layout property here that is.**
 * A bar that grows cannot avoid it: `scaleX` would stretch the text inside,
 * and a clip would move the text rather than reveal the bar. It is one
 * element, once, on a section that is already pinned — not a per-frame cost.
 *
 * **`x` is measured, not a percentage.** The bar has to end flush with the
 * left edge of a column whose width depends on the viewport, so the column is
 * measured and the closed bar is offset by half the difference. A percentage
 * would be a percentage of the bar, which is a different number.
 *
 * The row of names scrolls **inside itself** when the five are wider than the
 * column, and the active one is kept in view by setting the row's own
 * `scrollLeft`. Never `scrollIntoView`: that walks up to the page and would
 * scroll the document — and the document scrolling is what changes the active
 * pillar, so it would drive itself.
 *
 * **The bar never sets the active pillar.** Clicking a name asks the section
 * to scroll there, and the scroll sets it like any other scroll — so the bar
 * and the pillar above it cannot disagree.
 */
export function PillarBar({ labels, active, open, onSelect }: PillarBarProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const measure = () => setWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Keep the lit name in view, by moving the row and nothing else.
  useEffect(() => {
    if (!open) return;
    const row = rowRef.current;
    const option = optionRefs.current[active];
    if (!row || !option) return;
    row.scrollTo({
      left: option.offsetLeft + option.offsetWidth / 2 - row.clientWidth / 2,
      behavior: 'smooth',
    });
  }, [active, open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = labels.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? Math.min(last, active + 1)
        : event.key === 'ArrowLeft'
          ? Math.max(0, active - 1)
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1;

    if (next === -1) return;
    event.preventDefault();
    onSelect(next);
  };

  // Before the first measurement there is no column width to centre against,
  // so the bar stays where the layout puts it rather than jumping from zero.
  const closedOffset = width > CLOSED_WIDTH ? (width - CLOSED_WIDTH) / 2 : 0;

  return (
    <div ref={wrapRef} className="relative h-14 w-full">
      <motion.div
        initial={false}
        animate={{
          width: open ? width || CLOSED_WIDTH : CLOSED_WIDTH,
          x: open ? 0 : closedOffset,
        }}
        transition={OPEN_TRANSITION}
        className="bg-accent rounded-pill absolute top-0 left-0 flex h-14 items-center overflow-hidden"
      >
        {/* The mark stays put through the whole move, so the bar reads as one
            object growing rather than as a new object replacing a small one. */}
        <span aria-hidden="true" className="bg-accent-fg/25 ml-4 size-2 shrink-0 rounded-full" />

        {/* Both states live in the same box and cross-fade. Swapping the
            children at the threshold instead would resize the bar's content on
            the frame the width starts moving, and the text would jump. */}
        <div className="relative min-w-0 flex-1">
          <motion.span
            aria-hidden={open}
            initial={false}
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: 0.25 }}
            className="text-accent-fg text-label absolute inset-y-0 left-4 flex items-center whitespace-nowrap"
          >
            {HOME_PILLAR_BAR.closedLabel}
          </motion.span>

          <motion.div
            role="tablist"
            aria-label={HOME_PILLAR_BAR.tablistLabel}
            aria-hidden={!open}
            onKeyDown={onKeyDown}
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.35, delay: open ? 0.25 : 0 }}
            ref={rowRef}
            className={cn(
              'gap-xs flex scrollbar-none items-center overflow-x-auto px-2',
              !open && 'pointer-events-none',
            )}
          >
            {labels.map((label, i) => {
              const selected = i === active;

              return (
                <motion.button
                  key={label}
                  ref={(node) => {
                    optionRefs.current[i] = node;
                  }}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  tabIndex={selected && open ? 0 : -1}
                  onClick={() => onSelect(i)}
                  initial={false}
                  // Arriving one after another, in reading order, so the bar
                  // fills rather than appearing already full.
                  animate={{ opacity: open ? 1 : 0, x: open ? 0 : -8 }}
                  transition={{ duration: 0.3, delay: open ? 0.3 + i * 0.06 : 0 }}
                  className={cn(
                    'rounded-pill text-label duration-fast relative shrink-0 px-3.5 py-2 whitespace-nowrap transition-colors',
                    selected ? 'text-accent' : 'text-accent-fg/60 hover:text-accent-fg',
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="pillar-bar-pill"
                      aria-hidden="true"
                      className="bg-accent-fg rounded-pill absolute inset-0"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
