import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface ProgrammeTabsProps {
  labels: string[];
  /** Which entry is live. Derived from the scroll position by the section. */
  index: number;
  /** Scroll the reader to entry `i`. The strip never sets the index itself. */
  onSelect: (index: number) => void;
  ariaLabel: string;
}

/**
 * The five names, with a pill that travels to whichever is live.
 *
 * The pill moves and the labels hold still. That is worth stating because this
 * site has one strip that does the opposite — the mock placements board, where
 * the labels slide past a stationary pill. That one was built from screenshots
 * of the reference and got it backwards; the reference's own markup shows a
 * pill translating to the active tab inside a row that scrolls sideways, which
 * is the ordinary arrangement and the one `SegmentedTabs` already uses
 * everywhere else here.
 *
 * Its own component rather than `SegmentedTabs` for one reason: that control
 * scrolls the selected tab into view whenever the selection changes, which is
 * right when a reader clicked it and wrong here, where the selection changes on
 * every step of a scroll the reader is already driving. A control that scrolls
 * the page in response to the page being scrolled is a fight, not a feature.
 *
 * **The strip never sets the index.** Clicking asks the section to scroll to
 * that entry, and the scroll sets the index like any other scroll — so the
 * strip and the stage behind it cannot disagree. The rule `MobileStack`
 * documents, after a bar that assigned an index directly snapped back the
 * moment the reader moved a pixel.
 *
 * Real tabs with arrow keys, not five decorative dots: the five entries are
 * otherwise reachable only by scrolling a long section, and a keyboard user
 * needs a way through it.
 */
export function ProgrammeTabs({ labels, index, onSelect, ariaLabel }: ProgrammeTabsProps) {
  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = labels.length - 1;
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? Math.min(last, index + 1)
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? Math.max(0, index - 1)
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1;

    if (next === -1) return;
    event.preventDefault();
    onSelect(next);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className="gap-xs flex flex-wrap"
    >
      {labels.map((label, i) => {
        const selected = i === index;

        return (
          <button
            key={label}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(i)}
            className={cn(
              'rounded-pill text-label duration-fast relative px-3 py-1.5 whitespace-nowrap transition-colors',
              selected ? 'text-accent-fg' : 'text-text-muted hover:text-text',
            )}
          >
            {selected && (
              <motion.span
                layoutId="programme-tab-pill"
                aria-hidden="true"
                className="bg-accent rounded-pill absolute inset-0"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
