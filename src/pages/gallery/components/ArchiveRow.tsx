import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { formatEventDate, type ForeseEvent } from '@/data/events';
import type { GalleryPhoto } from '../data';

interface ArchiveRowProps {
  event: ForeseEvent;
  cover?: GalleryPhoto;
  photoCount: number;
  /** Position across the whole archive, not within the year. */
  index: number;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

/**
 * One event in the archive index.
 *
 * A row rather than a card, which is what lets sixty events stay browsable:
 * a card grid of sixty is a wall, a list of sixty is four screens you can scan
 * by name. The photograph is not lost — it arrives in the cursor preview on
 * desktop, and as an inline thumbnail on touch, where there is no hover to
 * trigger anything.
 *
 * A `Link`, not a click handler: middle-click, open-in-new-tab and the browser
 * back button all have to work on something this navigational.
 *
 * The `<li>` is supplied by the parent, which wraps each row in its reveal
 * animation — a motion `div` between `ul` and `li` would be invalid markup.
 */
export function ArchiveRow({
  event,
  cover,
  photoCount,
  index,
  onHoverStart,
  onHoverEnd,
}: ArchiveRowProps) {
  return (
    <Link
      to={`/gallery/${event.slug}`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      className="group border-border gap-md tablet:gap-lg relative grid grid-cols-[auto_1fr_auto] items-center border-b py-5"
    >
      <span className="text-caption text-text-subtle w-7 shrink-0 tabular-nums">
        {String(index).padStart(2, '0')}
      </span>

      {/* Touch devices get the picture inline, since nothing there can hover. */}
      {cover?.src && (
        <img
          src={cover.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="desktop:hidden size-12 shrink-0 rounded-md object-cover"
        />
      )}

      <span className="min-w-0">
        <span className="text-h3 tablet:text-h2 duration-base ease-out-brand block truncate transition-transform group-hover:translate-x-2">
          {event.name}
        </span>
      </span>

      <span className="text-small text-text-muted gap-lg flex shrink-0 items-center">
        <span className="tablet:inline hidden">{formatEventDate(event.date)}</span>
        <span className="tabular-nums">{photoCount}</span>
        <ArrowUpRight
          size={18}
          strokeWidth={2}
          aria-hidden="true"
          className="text-text duration-base ease-out-brand -translate-x-1 opacity-0 transition-[opacity,transform] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        />
      </span>

      {/* A rule that wipes in under the row on hover. Scale, not width, so it
          animates on the compositor rather than triggering layout. */}
      <span
        aria-hidden="true"
        className="bg-accent duration-base ease-out-brand absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 transition-transform group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
    </Link>
  );
}
