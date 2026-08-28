import { ImageIcon, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { GalleryPhoto } from '../data';

interface PhotoTileProps {
  photo: GalleryPhoto;
  /** Human position in the album, for the accessible name. */
  position: number;
  total: number;
  eventName: string;
  onOpen: () => void;
  /** The first few tiles on the page load eagerly; the rest are lazy. */
  eager?: boolean;
}

/**
 * A single photograph in an album.
 *
 * A button, not a div with a click handler — it opens a dialog, so it has to
 * be reachable and activatable from the keyboard, and announce what it does.
 *
 * The tile reserves its exact box from the photograph's intrinsic dimensions
 * before anything loads. On a page of this many images that is the difference
 * between a grid that settles once and one that reflows all the way down as
 * pictures arrive.
 */
export function PhotoTile({
  photo,
  position,
  total,
  eventName,
  onOpen,
  eager = false,
}: PhotoTileProps) {
  const { src, width, height, alt } = photo;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${eventName}: ${alt}. Photograph ${position} of ${total}. Open larger view.`}
      className={cn(
        'group border-border bg-surface-raised relative block w-full overflow-hidden rounded-lg border',
        'duration-base ease-out-brand transition-[border-color,box-shadow]',
        'hover:border-border-strong hover:shadow-lg',
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="duration-slow ease-out-brand h-full w-full object-cover transition-transform group-hover:scale-[1.04]"
        />
      ) : (
        /* ⚠️ SCAFFOLDING — the shape of a photograph that has not arrived yet.
           Delete this branch once every album has real images. */
        <span className="bg-line-grid text-text-subtle absolute inset-0 flex flex-col items-center justify-center gap-2">
          <ImageIcon size={22} strokeWidth={1.5} aria-hidden="true" />
          <span className="text-caption">Photo to be added</span>
        </span>
      )}

      {/* Hover affordance. Pointer-events off so it never intercepts the click
          that the whole tile already handles. */}
      <span
        aria-hidden="true"
        className={cn(
          'bg-surface-inverse/70 text-text-inverse rounded-pill pointer-events-none absolute top-3 right-3 flex size-9 items-center justify-center backdrop-blur-sm',
          'duration-base ease-out-brand opacity-0 transition-opacity',
          'group-hover:opacity-100 group-focus-visible:opacity-100',
        )}
      >
        <Maximize2 size={16} strokeWidth={2} />
      </span>
    </button>
  );
}
