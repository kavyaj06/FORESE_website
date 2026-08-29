import { CalendarDays, Clock } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatEventWhen, relativeWhen, type ForeseEvent } from '@/data/events';
import { cn } from '@/lib/cn';

interface UpcomingEventCardProps {
  event: ForeseEvent;
  /** Position in the upcoming list, drawn as the ghost numeral. */
  index: number;
}

/**
 * An event still to come.
 *
 * Undated events are shown, not hidden. The club announces things well before
 * it fixes a date, and "Alumni Interaction — date to be announced" is real
 * information; dropping it until a date exists would make the page look emptier
 * than the club is. The card marks the difference rather than faking a date:
 * a dated one carries a countdown, an undated one says plainly that it is
 * being arranged.
 */
export function UpcomingEventCard({ event, index }: UpcomingEventCardProps) {
  const countdown = relativeWhen(event);
  const dated = Boolean(event.date);

  return (
    <Card padding="lg" className="group relative h-full overflow-hidden">
      <span
        aria-hidden="true"
        className="text-border font-display tablet:block pointer-events-none absolute top-2 right-4 hidden text-[4.5rem] leading-none font-bold select-none"
      >
        {String(index).padStart(2, '0')}
      </span>

      <div className="relative flex h-full flex-col">
        <p
          className={cn(
            'text-small gap-xs flex items-center',
            dated ? 'text-text' : 'text-text-subtle italic',
          )}
        >
          <CalendarDays size={15} strokeWidth={1.75} aria-hidden="true" />
          {formatEventWhen(event)}
        </p>

        <h3 className="text-h3 mt-sm">{event.name}</h3>

        {event.blurb && (
          <p className="text-body text-text-muted mt-sm max-w-[52ch]">{event.blurb}</p>
        )}

        {countdown && (
          <p className="text-caption text-text-muted border-border mt-lg pt-md gap-xs mt-auto flex items-center border-t">
            <Clock size={14} strokeWidth={1.75} aria-hidden="true" />
            {/* Intl gives "in 3 weeks" — capitalised here for the start of a line. */}
            <span className="first-letter:uppercase">{countdown}</span>
          </p>
        )}
      </div>
    </Card>
  );
}
