import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface StepRailProps {
  labels: string[];
  /** Which entry is live. Rounded from the scroll position by the section. */
  index: number;
  /** Scroll the reader to entry `i`. The rail never sets the index itself. */
  onSelect: (index: number) => void;
  ariaLabel: string;
  className?: string;
}

/**
 * Which of the five is on screen, and a way to jump to any of them.
 *
 * A vertical rail, not the horizontal pill strip the mock placements board
 * uses. The two are different things and should not look alike: that strip is
 * a set of topics you pick between, sitting under the thing it controls, and
 * this is a position marker down the side of a stage that is stepping through
 * a list on its own. Given the same shape they would read as the same control
 * appearing twice on one site, and a reader would expect the same behaviour
 * from both.
 *
 * The marker is one element that moves (`layoutId`), not a border that fades
 * in on one row while fading out on another. One object travelling the rail is
 * legible as a position; several rows blinking is noise. The same reasoning
 * `SegmentedTabs` records for its pill.
 *
 * **The rail never sets the index.** Clicking asks the section to scroll to
 * that entry, and the scroll sets the index like any other scroll. Two writers
 * on one piece of state is how a control ends up disagreeing with the thing it
 * controls — the rule the phone board documents, and the reason its tab bar
 * scrolls rather than assigns.
 *
 * Real controls: a `tablist` with arrow keys, not a row of decorative dots.
 * Somebody who cannot scroll a pinned section by wheel still needs a way
 * through it, and five entries hidden behind a scroll position with no
 * keyboard route would be five entries they never reach.
 */
export function StepRail({ labels, index, onSelect, ariaLabel, className }: StepRailProps) {
  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = labels.length - 1;
    const next =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? Math.min(last, index + 1)
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
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
      aria-orientation="vertical"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn('flex flex-col', className)}
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
            className="gap-sm group relative flex items-center py-2 text-left"
          >
            {/* The rule the marker runs down. Its own element rather than a
                border on the button, so the marker can overlay it exactly
                without the two rounding to different pixels. */}
            <span aria-hidden="true" className="bg-border relative h-6 w-px shrink-0">
              {selected && (
                <motion.span
                  layoutId="programme-step-marker"
                  className="bg-accent absolute -inset-y-1 -left-px w-[3px]"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
            </span>

            <span
              className={cn(
                'text-label duration-base ease-out-brand transition-colors',
                selected ? 'text-text' : 'text-text-subtle group-hover:text-text-muted',
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
