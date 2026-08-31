import { PageHero } from '@/components/sections/PageHero';
import { groupEventsByStatus } from '@/data/events';
import { EventsBoard } from './sections/EventsBoard';
import { EVENTS_INTRO } from './data';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Events.
 *
 * Three states — running now, coming, done — all derived from the dates at
 * render. Nothing here is flagged by hand, so an event moves between them on
 * its own.
 */
export default function EventsPage() {
  const groups = groupEventsByStatus();

  return (
    <>
      <PageHero
        eyebrow={EVENTS_INTRO.eyebrow}
        title={EVENTS_INTRO.title}
        description={EVENTS_INTRO.description}
        size="compact"
        // Zero-padded. Single digits set beside a label look like a stray
        // character; two figures read as a count. `padStart` only ever adds,
        // so this keeps working when a number reaches double digits.
        meta={[
          `${pad(groups.ongoing.length)} running now`,
          `${pad(groups.upcoming.length)} upcoming`,
          `${pad(groups.completed.length)} completed`,
        ]}
      />
      <EventsBoard />
    </>
  );
}
