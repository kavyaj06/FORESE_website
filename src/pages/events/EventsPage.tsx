import { PageHero } from '@/components/sections/PageHero';
import { groupEventsByStatus } from '@/data/events';
import { EventsBoard } from './sections/EventsBoard';
import { EVENTS_INTRO } from './data';

/**
 * Events.
 *
 * Three states — running now, coming, done — each derived from the dates at
 * render. Nothing here is flagged by hand, so an event moves between the
 * sections on its own.
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
        meta={[
          `${groups.ongoing.length} running now`,
          `${groups.upcoming.length} upcoming`,
          `${groups.completed.length} completed`,
        ]}
      />
      <EventsBoard />
    </>
  );
}
