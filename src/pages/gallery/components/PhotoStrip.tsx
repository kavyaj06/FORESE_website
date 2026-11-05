import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import type { StripPhoto } from '../data';

interface PhotoStripProps {
  items: StripPhoto[];
}

/**
 * The gallery index's closing strip: photographs from every album, one open
 * and the rest as slivers that expand as the pointer crosses them.
 *
 * The same device the album pages use — see `AlbumAccordion`, which this is a
 * sibling of rather than a copy, because the two differ in the one way that
 * matters. There, a panel opens the Lightbox, because you are already inside
 * the album and the next thing you want is the picture bigger. Here a panel
 * is a link to the album the photograph came from, because you are choosing
 * where to go. Same silhouette, different promise, and a shared component
 * taking an `onOpen` that is sometimes navigation would hide that difference
 * rather than express it.
 *
 * Desktop only, and that is a decision rather than a shortcut: the whole
 * interaction is hover, and a sliver is far under the 44px a finger needs.
 * Narrow screens get the full-bleed `PhotoBand` instead, which is the better
 * closing frame on a phone anyway.
 *
 * Panels are real links, so the strip is reachable by keyboard and focus
 * opens the same panel the pointer would.
 */
export function PhotoStrip({ items }: PhotoStripProps) {
  const [active, setActive] = useState(0);

  return (
    <div
      className="desktop:flex gap-sm hidden h-[24rem]"
      onMouseLeave={() => setActive(0)}
      onBlur={(event) => {
        // Only when focus has left the strip entirely, not when it moves
        // between two panels inside it.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(0);
      }}
    >
      {items.map(({ photo, event }, index) => {
        const isActive = index === active;

        return (
          <Link
            key={`${event.id}-${photo.id}`}
            to={`/gallery/${event.slug}`}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            aria-label={`${event.name}: ${photo.alt}. Open the album.`}
            className={cn(
              'border-border relative min-w-0 overflow-hidden rounded-lg border',
              'ease-out-brand transition-[flex-grow,border-color] duration-500',
              isActive ? 'border-border-strong flex-[6]' : 'flex-[1]',
            )}
          >
            <img
              src={photo.src}
              alt=""
              width={photo.width}
              height={photo.height}
              loading={index < 3 ? 'eager' : 'lazy'}
              decoding="async"
              className="h-full w-full object-cover"
            />

            {/* Slivers darkened so the open photograph is unambiguous: a row
                of equally bright slices reads as a broken layout. */}
            <span
              aria-hidden="true"
              className={cn(
                'ease-out-brand pointer-events-none absolute inset-0 bg-black transition-opacity duration-500',
                isActive ? 'opacity-0' : 'opacity-30',
              )}
            />

            <span
              aria-hidden="true"
              className={cn(
                'ease-out-brand pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 to-transparent transition-opacity duration-500',
                isActive ? 'opacity-100' : 'opacity-0',
              )}
            />

            <span
              aria-hidden="true"
              className={cn(
                'p-lg gap-xs ease-out-brand absolute inset-x-0 bottom-0 flex flex-col text-left text-white transition-[opacity,transform] duration-500',
                isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
              )}
            >
              <span className="text-eyebrow uppercase opacity-80">View the album</span>
              <span className="text-body truncate">{event.name}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
