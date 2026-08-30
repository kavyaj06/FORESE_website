import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Images, MapPin } from 'lucide-react';
import { eventStatus, formatEventWhen, relativeWhen, type ForeseEvent } from '@/data/events';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

interface EventRowProps {
  event: ForeseEvent;
  /** Photographs available, when the event has an album. */
  photoCount: number;
}

/**
 * One event as a horizontal card: thumbnail, details, action.
 *
 * The same shape carries all three states, with the status shown as a badge
 * rather than by giving each state its own layout. A list you can scan down
 * beats three visually different lists once filtering exists — after choosing
 * "Upcoming" the reader already knows what they are looking at, and a
 * differently-shaped card would only make the list harder to compare.
 *
 * The whole card is not a link. Only events with photographs have anywhere to
 * go, so the action is an explicit link on the right; making the entire row
 * clickable would leave two thirds of them as dead targets.
 */
export function EventRow({ event, photoCount }: EventRowProps) {
  const status = eventStatus(event);
  const countdown = relativeWhen(event);
  const hasAlbum = photoCount > 0;

  return (
    <article
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

      <div className="tablet:shrink-0">
        {hasAlbum ? (
          <Link
            to={`/gallery/${event.slug}`}
            className="text-label border-border hover:border-border-strong hover:bg-surface duration-fast rounded-pill gap-xs inline-flex items-center border px-4 py-2.5 transition-colors"
          >
            <Images size={15} strokeWidth={1.75} aria-hidden="true" />
            {photoCount} photos
            <ArrowUpRight
              size={15}
              strokeWidth={2}
              aria-hidden="true"
              className="duration-fast ease-out-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        ) : (
          <p className="text-caption text-text-subtle italic">
            {status === 'completed' ? 'No photographs yet' : 'Details to follow'}
          </p>
        )}
      </div>
    </article>
  );
}
