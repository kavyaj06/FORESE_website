import { Link } from 'react-router-dom';
import { ArrowUpRight, Images } from 'lucide-react';
import { formatEventWhen, type ForeseEvent } from '@/data/events';

interface CompletedEventRowProps {
  event: ForeseEvent;
  index: number;
  /** Number of photographs, when the event has an album. */
  photoCount: number;
}

/**
 * A completed event.
 *
 * A row, not a card. Completed events accumulate without limit — a card grid
 * of forty past events is a wall, where forty rows stay a list you can scan.
 * It is the same reasoning as the gallery archive, and deliberately the same
 * shape, so the two pages feel like one site.
 *
 * Rows with photographs link to the album; rows without are plain text, since
 * a link that goes nowhere is worse than no link.
 *
 * The `<li>` is supplied by the parent, which wraps each row in its reveal
 * animation.
 */
export function CompletedEventRow({ event, index, photoCount }: CompletedEventRowProps) {
  const hasAlbum = photoCount > 0;

  const body = (
    <>
      <span className="text-caption text-text-subtle w-7 shrink-0 tabular-nums">
        {String(index).padStart(2, '0')}
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-h3 duration-base ease-out-brand block truncate transition-transform group-hover:translate-x-1">
          {event.name}
        </span>
      </span>

      <span className="text-small text-text-muted gap-lg flex shrink-0 items-center">
        <span className="tablet:inline hidden">{formatEventWhen(event)}</span>
        {hasAlbum && (
          <span className="gap-xs flex items-center">
            <Images size={15} strokeWidth={1.75} aria-hidden="true" />
            <span className="tabular-nums">{photoCount}</span>
          </span>
        )}
        {hasAlbum && (
          <ArrowUpRight
            size={18}
            strokeWidth={2}
            aria-hidden="true"
            className="text-text duration-base ease-out-brand -translate-x-1 opacity-0 transition-[opacity,transform] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
          />
        )}
      </span>
    </>
  );

  const shared =
    'group border-border gap-md tablet:gap-lg relative flex items-center border-b py-5';

  if (!hasAlbum) {
    return <div className={shared}>{body}</div>;
  }

  return (
    <Link to={`/gallery/${event.slug}`} className={shared}>
      {body}
      <span
        aria-hidden="true"
        className="bg-accent duration-base ease-out-brand absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 transition-transform group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
    </Link>
  );
}
