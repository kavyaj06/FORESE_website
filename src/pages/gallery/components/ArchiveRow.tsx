import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { formatEventWhen, type ForeseEvent } from '@/data/events';
import type { GalleryPhoto } from '../data';

interface ArchiveRowProps {
  event: ForeseEvent;
  cover?: GalleryPhoto;
  photoCount: number;
  /** Position across the whole index, not within the year. */
  index: number;
}

/**
 * One earlier event in the archive list.
 *
 * The cover thumbnail is always visible, at every breakpoint. An earlier
 * version revealed the picture only on hover, which meant the page showed no
 * photographs until you moved the mouse and showed none at all on a phone.
 * A gallery should not hide its pictures behind an interaction.
 *
 * A `Link`, not a click handler: middle-click, open-in-new-tab and the browser
 * back button all have to work on something this navigational.
 *
 * The `<li>` is supplied by the parent, which wraps each row in its reveal
 * animation — a motion `div` between `ul` and `li` would be invalid markup.
 */
export function ArchiveRow({ event, cover, photoCount, index }: ArchiveRowProps) {
  return (
    <Link
      to={`/gallery/${event.slug}`}
      className="group border-border gap-md tablet:gap-lg relative flex items-center border-b py-4"
    >
      <span className="text-caption text-text-subtle w-7 shrink-0 tabular-nums">
        {String(index).padStart(2, '0')}
      </span>

      {cover?.src && (
        <span className="border-border size-14 shrink-0 overflow-hidden rounded-md border">
          <img
            src={cover.src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="duration-base ease-out-brand h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="text-h3 duration-base ease-out-brand block truncate transition-transform group-hover:translate-x-1">
          {event.name}
        </span>
      </span>

      <span className="text-small text-text-muted gap-lg flex shrink-0 items-center">
        <span className="tablet:inline hidden">{formatEventWhen(event)}</span>
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
