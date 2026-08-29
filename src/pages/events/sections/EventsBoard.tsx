import { useMemo } from 'react';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { groupEventsByStatus } from '@/data/events';
import { albumFor } from '@/pages/gallery/data';
import { CompletedEventRow } from '../components/CompletedEventRow';
import { OngoingEventCard } from '../components/OngoingEventCard';
import { UpcomingEventCard } from '../components/UpcomingEventCard';
import { EVENT_GROUPS } from '../data';

/**
 * The three states, each with the treatment its job needs.
 *
 * Deliberately not three identical grids. An event running today, one being
 * planned, and one from two years ago are read for different reasons, and
 * giving them the same card would flatten that:
 *
 *  - Ongoing is a full-width inverse band. There is rarely more than one, it
 *    is the only thing on the page a visitor could act on today, and it should
 *    be impossible to scroll past.
 *  - Upcoming is a card grid, sized for a handful, carrying a countdown.
 *  - Completed is a list of rows, because past events accumulate for ever and
 *    forty cards is a wall where forty rows is still a list.
 *
 * Empty groups render their own message rather than vanishing. A page that
 * silently drops a heading leaves the visitor unsure whether there is nothing
 * scheduled or whether the page is broken.
 */
export function EventsBoard() {
  const groups = useMemo(() => groupEventsByStatus(), []);

  return (
    <>
      {groups.ongoing.map((event) => (
        <OngoingEventCard
          key={event.id}
          event={event}
          albumSlug={albumFor(event.id)?.photos.length ? event.slug : undefined}
        />
      ))}

      <section className="py-section">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={EVENT_GROUPS.upcoming.eyebrow}
              title={EVENT_GROUPS.upcoming.title}
            />
          </Reveal>

          {groups.upcoming.length === 0 ? (
            <p className="text-body text-text-muted mt-xl">{EVENT_GROUPS.upcoming.empty}</p>
          ) : (
            <div className="mt-2xl gap-lg tablet:grid-cols-2 grid">
              {groups.upcoming.map((event, index) => (
                <Reveal key={event.id} delay={(index % 2) * 0.07} motionStyle="scale">
                  <UpcomingEventCard event={event} index={index + 1} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="border-border bg-surface py-section border-t">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={EVENT_GROUPS.completed.eyebrow}
              title={EVENT_GROUPS.completed.title}
            />
          </Reveal>

          {groups.completed.length === 0 ? (
            <p className="text-body text-text-muted mt-xl">{EVENT_GROUPS.completed.empty}</p>
          ) : (
            <ul className="mt-2xl">
              {groups.completed.map((event, index) => (
                <Reveal key={event.id} as="li" delay={(index % 4) * 0.05}>
                  <CompletedEventRow
                    event={event}
                    index={index + 1}
                    photoCount={albumFor(event.id)?.photos.length ?? 0}
                  />
                </Reveal>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
