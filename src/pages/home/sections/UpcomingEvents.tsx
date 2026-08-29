import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Card } from '@/components/ui';
import { formatEventDate, upcomingEvents } from '@/data/events';
import { HOME_EVENTS } from '../data';

/**
 * The outline's "Upcoming Events" panel.
 *
 * Derived from the shared event list by comparing dates at render, so an event
 * leaves this panel by itself the day after it happens. There is no "upcoming"
 * flag for anyone to forget to switch off.
 */
export function UpcomingEvents() {
  const events = upcomingEvents();

  return (
    <section className="py-section">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={HOME_EVENTS.eyebrow}
            title={HOME_EVENTS.title}
            description={HOME_EVENTS.description}
          />
        </Reveal>

        {events.length === 0 ? (
          <p className="text-body text-text-muted mt-xl">{HOME_EVENTS.emptyMessage}</p>
        ) : (
          <div className="mt-2xl gap-lg tablet:grid-cols-2 grid">
            {events.map((event, index) => (
              <Reveal key={event.id} delay={index * 0.07} motionStyle="scale">
                <Card padding="lg" className="group h-full">
                  <p className="text-small text-text-muted gap-xs flex items-center">
                    <CalendarDays size={15} strokeWidth={1.75} aria-hidden="true" />
                    {formatEventDate(event.date)}
                  </p>

                  <h3 className="text-h3 mt-sm gap-sm flex items-start justify-between">
                    {event.name}
                    <ArrowUpRight
                      size={20}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="text-text-subtle duration-base ease-out-brand mt-1 shrink-0 -translate-x-1 opacity-0 transition-[opacity,transform] group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </h3>

                  {event.blurb && <p className="text-body text-text-muted mt-sm">{event.blurb}</p>}
                </Card>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
