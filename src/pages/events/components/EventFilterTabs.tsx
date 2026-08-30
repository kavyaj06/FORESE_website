import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export type EventFilter = 'all' | 'ongoing' | 'upcoming' | 'completed';

interface EventFilterTabsProps {
  value: EventFilter;
  onChange: (next: EventFilter) => void;
  counts: Record<EventFilter, number>;
}

const TABS: { id: EventFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

/**
 * Filter for the events list.
 *
 * Real tabs, wired to `role="tablist"` with arrow-key navigation, rather than
 * buttons that happen to look like tabs — a screen reader should be told this
 * is a set of four choices with one selected, not read four unrelated buttons.
 *
 * The selected pill is one element sliding between tabs (`layoutId`), not four
 * backgrounds fading in and out. One object moving is legible; four things
 * blinking is noise.
 *
 * A tab with nothing behind it is disabled rather than hidden. Tabs that come
 * and go change the width of the control between renders, and a filter that
 * silently loses an option looks broken.
 */
export function EventFilterTabs({ value, onChange, counts }: EventFilterTabsProps) {
  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const current = TABS.findIndex((tab) => tab.id === value);
    onChange(TABS[(current + step + TABS.length) % TABS.length].id);
  };

  return (
    <div
      role="tablist"
      aria-label="Filter events"
      onKeyDown={onKeyDown}
      className="border-border bg-surface gap-xs rounded-pill flex scrollbar-none overflow-x-auto border p-1"
    >
      {TABS.map((tab) => {
        const selected = tab.id === value;
        const count = counts[tab.id];

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={count === 0}
            onClick={() => onChange(tab.id)}
            className={cn(
              'text-label rounded-pill duration-fast relative shrink-0 px-4 py-2 whitespace-nowrap transition-colors',
              selected ? 'text-accent-fg' : 'text-text-muted hover:text-text',
              count === 0 && 'hover:text-text-muted cursor-not-allowed opacity-40',
            )}
          >
            {selected && (
              <motion.span
                layoutId="event-tab-pill"
                aria-hidden="true"
                className="bg-accent rounded-pill absolute inset-0"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative">
              {tab.label}
              <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
