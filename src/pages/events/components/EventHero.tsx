import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui';
import { eventStatus, formatEventWhen, relativeWhen, type ForeseEvent } from '@/data/events';
import { EVENT_PAGE } from '../data';

/**
 * The top of an event's own page: its photograph, its name, its line.
 *
 * The one hero on this site built on an image rather than on the dot field.
 * An event is a day that happened in a room full of people, and the page for
 * it should open on that rather than on type — which is also how the club's
 * previous site opened theirs, and the reason this page exists at all.
 *
 * The scrim is not decoration. White text over an arbitrary photograph is
 * unreadable by luck; the gradient is what makes it legible over a bright
 * ceiling and a dark doorway alike, and it is the same treatment `AlbumCard`
 * and `PhotoTile` already use over photographs elsewhere.
 *
 * Without a cover the section still works: it falls back to the inverse band
 * every other page hero uses, so an event added in the editor before anyone
 * has uploaded a photograph does not land on a broken box.
 */
export function EventHero({ event }: { event: ForeseEvent }) {
  const status = eventStatus(event);
  const countdown = relativeWhen(event);

  return (
    <header
      data-theme="inverse"
      className="bg-bg tablet:min-h-[30rem] relative isolate flex min-h-[24rem] flex-col justify-end overflow-hidden"
    >
      {event.cover && (
        <>
          <img
            src={event.cover}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/70 to-black/50"
          />
        </>
      )}

      <Container className="py-2xl tablet:py-3xl gap-lg flex flex-col">
        <Link
          to="/events"
          className="text-label text-text-muted hover:text-text gap-xs duration-fast group inline-flex w-fit items-center transition-colors"
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
            className="duration-fast transition-transform group-hover:-translate-x-0.5"
          />
          {EVENT_PAGE.back}
        </Link>

        <div className="gap-md flex flex-col">
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

          {/* The headline, not the name, when the club has written one: a page
              can afford to say what the day is for where a row can only say
              what it is called. */}
          <h1 className="text-display max-w-[20ch] text-balance">{event.headline ?? event.name}</h1>

          {(event.tagline ?? event.blurb) && (
            <p className="text-body-lg text-text-muted max-w-[52ch]">
              {event.tagline ?? event.blurb}
            </p>
          )}
        </div>
      </Container>
    </header>
  );
}
