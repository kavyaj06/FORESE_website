import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { formatEventWhen } from '@/data/events';
import { cn } from '@/lib/cn';
import type { GalleryIndexEntry } from '../data';

interface AlbumCardProps {
  entry: GalleryIndexEntry;
  /** `feature` is the wide leading card; `standard` sits in the pair below. */
  size: 'feature' | 'standard';
  /** Above the fold — skip lazy loading for the leading card. */
  eager?: boolean;
}

/**
 * An event as a cover photograph you can walk into.
 *
 * The title sits on the image under a scrim rather than beneath it. On a page
 * whose whole subject is photographs, a caption below a picture pushes the
 * next picture down and turns the grid into a list of documents; text on the
 * image keeps the pictures adjacent.
 *
 * The scrim is literal black, not a theme token: it darkens a photograph, so
 * it must stay dark whatever the surrounding theme does.
 */
export function AlbumCard({ entry, size, eager = false }: AlbumCardProps) {
  const { event, cover, photoCount } = entry;
  const isFeature = size === 'feature';

  return (
    <Link
      to={`/gallery/${event.slug}`}
      className={cn(
        'group border-border relative block overflow-hidden rounded-lg border',
        'duration-base ease-out-brand transition-[border-color,box-shadow]',
        'hover:border-border-strong hover:shadow-lg',
      )}
    >
      <div
        className={cn('relative', isFeature ? 'tablet:aspect-[21/9] aspect-[4/3]' : 'aspect-[4/3]')}
      >
        {cover?.src ? (
          <img
            src={cover.src}
            alt=""
            width={cover.width}
            height={cover.height}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="duration-slow ease-out-brand h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
          />
        ) : (
          <span className="bg-surface absolute inset-0" />
        )}

        {/* Always present, deepening on hover — the title has to stay legible
            at rest, so this cannot be a hover-only scrim. */}
        <span
          aria-hidden="true"
          className="duration-base ease-out-brand absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity group-hover:from-black/90"
        />

        <div className="p-lg gap-xs absolute inset-x-0 bottom-0 flex flex-col text-white">
          <p className="text-eyebrow gap-xs flex items-center uppercase opacity-80">
            {formatEventWhen(event)}
            <span aria-hidden="true">·</span>
            {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
          </p>

          <h3 className={cn('gap-sm flex items-center', isFeature ? 'text-h2' : 'text-h3')}>
            {event.name}
            <ArrowUpRight
              size={isFeature ? 24 : 20}
              strokeWidth={2}
              aria-hidden="true"
              className="duration-base ease-out-brand shrink-0 -translate-x-1 opacity-0 transition-[opacity,transform] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            />
          </h3>

          {isFeature && event.blurb && (
            <p className="text-small max-w-[46ch] opacity-85">{event.blurb}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
