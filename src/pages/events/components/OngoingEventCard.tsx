import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { formatEventWhen, type ForeseEvent } from '@/data/events';
import { Container } from '@/components/layout/Container';

interface OngoingEventCardProps {
  event: ForeseEvent;
  /** Set when photographs already exist for this event. */
  albumSlug?: string;
}

/**
 * An event happening right now.
 *
 * Full width and on the inverse band, because there is at most one or two of
 * these and they are the only thing on the page that is time-critical. Giving
 * them the same card as a completed event from last year would bury the one
 * piece of information a visitor might act on today.
 *
 * The live dot pulses. That is a deliberate exception to this site's rule
 * against continuous animation: it is a status indicator, in the same class as
 * a loading spinner, and its job is to say "this is live right now" at a
 * glance. It is the only pulsing thing on the site.
 */
export function OngoingEventCard({ event, albumSlug }: OngoingEventCardProps) {
  return (
    <section data-theme="inverse" className="py-section relative isolate overflow-hidden">
      <div aria-hidden="true" className="bg-dot-grid mask-radial-fade absolute inset-0 -z-10" />

      <Container>
        <div className="gap-lg flex flex-col items-start">
          <p className="text-eyebrow gap-xs flex items-center uppercase">
            <span aria-hidden="true" className="relative flex size-2">
              <span className="bg-accent rounded-pill absolute inline-flex h-full w-full opacity-60 motion-safe:animate-ping" />
              <span className="bg-accent rounded-pill relative inline-flex size-2" />
            </span>
            Happening now
          </p>

          {/* h2, not h3: this is the first section under the page h1, and its
              size comes from the type scale rather than the tag. */}
          <h2 className="text-h1 max-w-[20ch]">{event.name}</h2>

          {event.blurb && (
            <p className="text-body-lg text-text-muted max-w-content-narrow">{event.blurb}</p>
          )}

          <p className="text-small text-text-muted gap-xs flex items-center">
            <CalendarDays size={16} strokeWidth={1.75} aria-hidden="true" />
            {formatEventWhen(event)}
          </p>

          {albumSlug && (
            <Link
              to={`/gallery/${albumSlug}`}
              className="text-label group gap-xs duration-fast inline-flex items-center transition-opacity hover:opacity-70"
            >
              Photographs so far
              <ArrowUpRight
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="duration-fast ease-out-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}
