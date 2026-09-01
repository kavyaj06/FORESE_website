import { SegmentedTabs } from '@/components/sections/SegmentedTabs';

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
  return (
    <SegmentedTabs
      tabs={TABS.map((tab) => ({ ...tab, count: counts[tab.id] }))}
      value={value}
      onChange={onChange}
      layoutId="event-tab-pill"
      ariaLabel="Filter events"
    />
  );
}
