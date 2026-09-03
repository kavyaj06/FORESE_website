import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Card } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatEventDate, formatEventWhen, groupEventsByStatus } from '@/data/events';
import { upcomingStages } from '@/data/mockSchedule';
import { HOME_EVENTS } from '../data';

interface Entry {
  id: string;
  name: string;
  when: string;
  /** Sort key. ISO, or empty for an event with no announced date. */
  date: string;
  blurb?: string;
  kind: 'Mock placements' | 'Event';
}

/**
 * Everything the club has coming, in one list.
 *
 * This absorbed the Announcements panel that used to sit below it. That panel
 * was the same information under a different name: its entries were the dates
 * of the mock placement rounds, which is exactly what somebody reading
 * "Upcoming" is looking for. Two panels meant a reader had to check both to
 * find out what was next, and had no way to tell which one a given thing would
 * be in.
 *
 * Both sources are merged and sorted by date, so the next thing that happens
 * is the first card whatever kind of thing it is. The tag on each card is what
 * distinguishes them — a label on a card, rather than a whole section heading
 * and a second visual language.
 *
 * Nothing here is filtered or ordered by hand. Both lists derive their status
 * from the real clock at render, so an entry appears, moves up the list and
 * drops off it on the right mornings with no edit. Undated events still show:
 * the club announces things before it fixes a date, and they sort last because
 * "not yet scheduled" is the furthest-away thing there is.
 */
export function UpcomingEvents() {
  const entries: Entry[] = [
    ...upcomingStages().map((stage) => ({
      id: `stage-${stage.id}`,
      name: stage.name,
      when: formatEventDate(stage.date),
      date: stage.date,
      blurb: stage.blurb,
      kind: 'Mock placements' as const,
    })),
    ...groupEventsByStatus().upcoming.map((event) => ({
      id: `event-${event.id}`,
      name: event.name,
      when: formatEventWhen(event),
      date: event.date ?? '',
      blurb: event.blurb,
      kind: 'Event' as const,
    })),
  ].sort((a, b) => (a.date === '' ? 1 : b.date === '' ? -1 : a.date.localeCompare(b.date)));

  return (
    // Ember, and it is the only hot tone that could take this section: it
    // carries three paragraphs, and crimson fails every muted variant while
    // ember's ladder holds at 7.39 / 6.20 / 5.55. The `next` card inside
    // reads `bg-accent`, which on ember resolves to black — a black card on
    // orange, which is the arrangement the brand references use.
    <section data-tone="ember" className="py-section">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={HOME_EVENTS.eyebrow}
            title={HOME_EVENTS.title}
            description={HOME_EVENTS.description}
          />
        </Reveal>

        {entries.length === 0 ? (
          <p className="text-body text-text-muted mt-xl">{HOME_EVENTS.emptyMessage}</p>
        ) : (
          <div className="mt-2xl gap-lg tablet:grid-cols-2 grid">
            {/* The next thing to happen is the filled one. It is the answer to
                the question the section asks, and a grid of identical cards
                makes the reader find it by reading every date. */}
            {entries.map((entry, index) => {
              const next = index === 0;
              return (
                <Reveal key={entry.id} delay={index * 0.07} motionStyle="scale">
                  <Card
                    padding="lg"
                    className={cn('group h-full', next && 'border-accent bg-accent text-accent-fg')}
                  >
                    <div className="gap-sm flex flex-wrap items-center justify-between">
                      <p
                        className={cn(
                          'text-small gap-xs flex items-center',
                          next ? 'text-accent-fg/85' : 'text-text-muted',
                        )}
                      >
                        <CalendarDays size={15} strokeWidth={1.75} aria-hidden="true" />
                        {entry.when}
                      </p>
                      <span
                        className={cn(
                          'text-label rounded-pill border px-2.5 py-0.5',
                          next
                            ? 'border-accent-fg/40 text-accent-fg'
                            : 'border-border text-text-subtle',
                        )}
                      >
                        {entry.kind}
                      </span>
                    </div>

                    <h3 className="text-h3 mt-sm gap-sm flex items-start justify-between">
                      {entry.name}
                      <ArrowUpRight
                        size={20}
                        strokeWidth={2}
                        aria-hidden="true"
                        className={cn(
                          'duration-base ease-out-brand mt-1 shrink-0 -translate-x-1 opacity-0 transition-[opacity,transform] group-hover:translate-x-0 group-hover:opacity-100',
                          next ? 'text-accent-fg' : 'text-text-subtle',
                        )}
                      />
                    </h3>

                    {entry.blurb && (
                      <p
                        className={cn(
                          'text-body mt-sm',
                          next ? 'text-accent-fg/85' : 'text-text-muted',
                        )}
                      >
                        {entry.blurb}
                      </p>
                    )}
                  </Card>
                </Reveal>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
