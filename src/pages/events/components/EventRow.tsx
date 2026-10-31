import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { eventStatus, formatEventWhen, relativeWhen, type ForeseEvent } from '@/data/events';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/cn';
import { EVENT_PAGE } from '../data';

interface EventRowProps {
  event: ForeseEvent;
}

/**
 * One event as a horizontal card: thumbnail, details, action.
 *
 * The same shape carries all three states, with the status shown as a badge
 * rather than by giving each state its own layout.
 *
 * **The whole row is a link, and it goes to the event rather than to its
 * photographs.** It used to carry a "6 photos" pill to the gallery album,
 * which made the only thing a reader could do with an event look at pictures
 * of it — the page could not say what the event was or why to go. Every event
 * now has a page of its own, so every row has somewhere to go, which is what
 * the old doc-block here said was missing when it argued against making the
 * row a target.
 *
 * The link wraps the whole card rather than sitting inside it: one target,
 * one tab stop, and the accessible name is the event's name because that is
 * the only heading inside it.
 */
export function EventRow({ event }: EventRowProps) {
  const status = eventStatus(event);
  const countdown = relativeWhen(event);

  return (
    <Link
      to={`/events/${event.slug}`}
      className={cn(
        'group border-border bg-surface-raised gap-lg p-md tablet:flex-row tablet:items-center flex flex-col rounded-lg border',
        'duration-base ease-out-brand transition-[border-color,box-shadow]',
        'hover:border-border-strong hover:shadow-md',
      )}
    >
      {event.cover && (
        <div className="tablet:w-44 tablet:shrink-0 overflow-hidden rounded-md">
          <img
            src={event.cover}
            alt=""
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            className="duration-slow ease-out-brand aspect-[16/9] w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      <div className="gap-xs flex min-w-0 flex-1 flex-col">
        <div className="gap-sm flex flex-wrap items-center">
          <span className="text-caption text-text-muted gap-xs flex items-center">
            <CalendarDays size={14} strokeWidth={1.75} aria-hidden="true" />
            {formatEventWhen(event)}
          </span>

          {status === 'ongoing' && <Badge tone="accent">Ongoing</Badge>}
          {status === 'upcoming' && countdown && (
            <span className="text-caption text-text-subtle first-letter:uppercase">
              {countdown}
            </span>
          )}
        </div>

        <h3 className="text-h3">{event.name}</h3>

        {event.blurb && <p className="text-small text-text-muted max-w-[64ch]">{event.blurb}</p>}

        {event.venue && (
          <p className="text-caption text-text-subtle gap-xs mt-1 flex items-center">
            <MapPin size={13} strokeWidth={1.75} aria-hidden="true" />
            {event.venue}
          </p>
        )}
      </div>

      {/* The affordance, not a second control: the whole row is the link, and
          a nested one would be both invalid and a second tab stop to the same
          place. */}
      <div aria-hidden="true" className="tablet:shrink-0">
        <span className="text-label text-text-muted group-hover:text-text duration-fast gap-xs flex items-center transition-colors">
          {EVENT_PAGE.rowAction}
          <ArrowUpRight
            size={15}
            strokeWidth={2}
            className="duration-fast ease-out-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
