import { useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, ChevronDown, MapPin, Users } from 'lucide-react';
import {
  eventParagraphs,
  eventReasons,
  eventStatus,
  formatEventWhen,
  relativeWhen,
  type ForeseEvent,
} from '@/data/events';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/cn';
import { EVENT_DETAILS } from '../data';

interface EventRowProps {
  event: ForeseEvent;
  /** Photographs available, when the event has an album. */
  photoCount: number;
  /** Whether this row's details are open. Owned by the list — see `EventsBoard`. */
  open: boolean;
  onToggle: () => void;
}

/**
 * One event as a horizontal card: thumbnail, details, action.
 *
 * The same shape carries all three states, with the status shown as a badge
 * rather than by giving each state its own layout.
 *
 * **The row opens rather than going anywhere.** It used to carry a "6 photos"
 * pill to the gallery album, which meant the one thing a reader could do with
 * an event was look at pictures of it — the page could not say what the event
 * was or why to go. The pill is gone (photographs belong in the gallery) and
 * the slot now holds a toggle that opens the details underneath. Nothing
 * navigates: a page per event was ruled out, so the list stays put and one row
 * at a time expands into it.
 *
 * **Still not a link.** The panel contains one, and a link inside a clickable
 * row is a keyboard trap of the ordinary kind — two targets, one of them
 * invisible to a screen reader as a separate thing. The toggle is a real
 * `<button>` with `aria-expanded` and `aria-controls`, which is the whole of
 * what an accordion owes anybody.
 *
 * **The open/close animation is CSS, not framer.** A wrapper goes from
 * `grid-rows-[0fr]` to `grid-rows-[1fr]` over the panel, which animates to the
 * content's natural height without measuring it and without unmounting
 * anything. `AnimatePresence` is banned on this site — its exit callback has
 * not fired in production builds here — and this needs neither it nor a
 * height in pixels. The global reduced-motion guard in `animations.css`
 * collapses the transition on its own.
 *
 * A row with nothing to say does not offer a toggle, so a reader is never
 * invited to open an empty drawer.
 */
export function EventRow({ event, photoCount, open, onToggle }: EventRowProps) {
  const status = eventStatus(event);
  const countdown = relativeWhen(event);

  const paragraphs = eventParagraphs(event);
  const reasons = eventReasons(event);
  const hasAlbum = photoCount > 0;
  const hasDetails = paragraphs.length > 0 || reasons.length > 0 || Boolean(event.audience);
  const canOpen = hasDetails || hasAlbum;

  // Not derived from the slug: a filter change keeps the outgoing list
  // mounted beside the incoming one for 160ms (see `LIST_EXIT`), so a
  // slug-derived id would exist twice in the document and `aria-controls`
  // would point at whichever came first.
  const id = useId();
  const panelId = `${id}-details`;
  const toggleRef = useRef<HTMLButtonElement>(null);

  return (
    <article
      onKeyDown={(event_) => {
        // Focus may be sitting on the album link inside the panel, so closing
        // has to put it back on the control that opened it.
        if (event_.key !== 'Escape' || !open) return;
        onToggle();
        toggleRef.current?.focus();
      }}
      className={cn(
        'group border-border bg-surface-raised flex flex-col rounded-lg border',
        'duration-base ease-out-brand transition-[border-color,box-shadow]',
        'hover:border-border-strong hover:shadow-md',
        // Held open, the card keeps the state hovering gave it: a reader whose
        // pointer has moved on should still be able to see which row is open.
        open && 'border-border-strong shadow-md',
      )}
    >
      {/* `group/head` so the cover's hover zoom answers the header rather
          than the whole card — with a panel open, the old `group-hover` fired
          from anywhere in 500px of prose. */}
      <div className="group/head gap-lg p-md tablet:flex-row tablet:items-center relative flex flex-col">
        {event.cover && (
          <div className="tablet:w-44 tablet:shrink-0 overflow-hidden rounded-md">
            <img
              src={event.cover}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
              className="duration-slow ease-out-brand aspect-[16/9] w-full object-cover transition-transform group-hover/head:scale-105"
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

          <h3 className="text-h3">
            {canOpen ? (
              <button
                ref={toggleRef}
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={panelId}
                // The button is the title, and its `::after` is stretched over
                // the header — so the whole row is the hit area while the
                // control's accessible name is the event's name alone. A
                // button wrapped around the header instead would be invalid
                // (an h3 and a p are flow content, not phrasing) and would
                // read out as a forty-word name: date, title, blurb, venue.
                // The pseudo-element resolves against the header, not the
                // card, so it stops where the panel starts and the link
                // inside the panel stays reachable.
                className="rounded-md text-left after:absolute after:inset-0 after:content-['']"
              >
                {event.name}
              </button>
            ) : (
              event.name
            )}
          </h3>

          {event.blurb && <p className="text-small text-text-muted max-w-[64ch]">{event.blurb}</p>}

          {event.venue && (
            <p className="text-caption text-text-subtle gap-xs mt-1 flex items-center">
              <MapPin size={13} strokeWidth={1.75} aria-hidden="true" />
              {event.venue}
            </p>
          )}
        </div>

        {canOpen && (
          // Deliberately not a second button, and hidden from assistive
          // technology: the control is the title, and its name and state are
          // already announced there. Read out here as well it is a stray word
          // in the middle of the row.
          <div aria-hidden="true" className="tablet:shrink-0">
            <span className="text-label text-text-muted gap-xs flex items-center">
              {open ? EVENT_DETAILS.hide : EVENT_DETAILS.show}
              <ChevronDown
                size={15}
                strokeWidth={2}
                className={cn(
                  'duration-base ease-out-brand transition-transform',
                  open && 'rotate-180',
                )}
              />
            </span>
          </div>
        )}
      </div>

      <div
        id={panelId}
        onTransitionEnd={(event_) => {
          // A row near the foot of the page opens entirely below the fold —
          // on a phone the tap then looks like it did nothing. Only when it is
          // genuinely off screen, and never on the way closed.
          if (event_.propertyName !== 'grid-template-rows' || !open) return;
          const box = event_.currentTarget.getBoundingClientRect();
          if (box.bottom <= window.innerHeight) return;
          event_.currentTarget.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }}
        className={cn(
          'duration-base ease-out-brand grid transition-[grid-template-rows]',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        {/* `inert` rather than `hidden`: the panel has to stay in the layout to
            animate to its own height, and a collapsed panel that is merely
            invisible still takes keyboard focus and still gets read aloud. */}
        <div className="overflow-hidden" inert={!open}>
          <div className="border-border px-md pt-lg pb-md gap-lg flex flex-col border-t">
            {paragraphs.length > 0 && (
              <div className="gap-sm flex flex-col">
                <h4 className="text-label">{EVENT_DETAILS.about}</h4>
                {paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 32)}
                    className="text-small text-text-muted max-w-[68ch]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {reasons.length > 0 && (
              <div className="gap-sm flex flex-col">
                <h4 className="text-label">{EVENT_DETAILS.why}</h4>
                <ul className="gap-xs flex flex-col">
                  {reasons.map((reason) => (
                    <li
                      key={reason.slice(0, 32)}
                      className="gap-sm text-small text-text-muted flex max-w-[68ch] items-start"
                    >
                      <Check
                        size={15}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="text-text mt-0.5 shrink-0"
                      />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.audience && (
              <p className="text-caption text-text-subtle gap-xs flex items-center">
                <Users size={14} strokeWidth={1.75} aria-hidden="true" />
                {event.audience}
              </p>
            )}

            {hasAlbum && (
              <Link
                to={`/gallery/${event.slug}`}
                className="text-label text-text-muted hover:text-text gap-xs duration-fast group/photos inline-flex w-fit items-center transition-colors"
              >
                {photoCount} {EVENT_DETAILS.photos}
                <ArrowRight
                  size={15}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="duration-fast ease-out-brand transition-transform group-hover/photos:translate-x-0.5"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
