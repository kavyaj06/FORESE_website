import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { GalleryPhoto } from '../data';

interface AlbumAccordionProps {
  photos: GalleryPhoto[];
  eventName: string;
  onOpen: (index: number) => void;
}

/**
 * Horizontal accordion strip: one photograph open, the rest as slivers that
 * expand as you move across them.
 *
 * Desktop only, and that is a design decision rather than a shortcut. The
 * whole interaction is driven by hover, and a sliver is far below the 44px
 * touch target — on a phone this would be a row of unhittable slices. Narrow
 * screens get the masonry grid instead, which is the better layout there
 * anyway.
 *
 * Adapted from a 21st.dev pattern, with three things changed:
 *
 *  - Panels are real buttons. The original used bare `<img>` elements with
 *    click handlers, which made the entire gallery unreachable by keyboard.
 *    Focus moves through the strip and opens the same panel Enter would.
 *  - Leaving the strip resets to the first photograph. The original's
 *    `onMouseLeave` set the same index as `onMouseEnter`, so it did nothing.
 *  - Opening a photograph hands off to the shared Lightbox, so focus
 *    trapping, Escape and arrow-key paging are the site's existing
 *    implementation rather than a second, less careful one.
 *
 * On animating `flex-grow`: this is a layout-driven transition, which is
 * normally the thing to avoid. It is the right call here. The alternative —
 * a transform-based FLIP — visibly distorts a photograph while it resizes,
 * and with a dozen panels the layout cost is not measurable. Correct pictures
 * beat a cheaper frame.
 */
export function AlbumAccordion({ photos, eventName, onOpen }: AlbumAccordionProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="desktop:flex gap-sm hidden h-[26rem]" onMouseLeave={() => setActive(0)}>
      {photos.map((photo, index) => {
        const isActive = index === active;

        return (
          <button
            key={photo.id}
            type="button"
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => onOpen(index)}
            aria-label={`${eventName}: ${photo.alt}. Photograph ${index + 1} of ${photos.length}. Open larger view.`}
            className={cn(
              'group border-border relative min-w-0 overflow-hidden rounded-lg border',
              'ease-out-brand transition-[flex-grow,border-color] duration-500',
              isActive ? 'border-border-strong flex-[7]' : 'flex-[1]',
            )}
          >
            <img
              src={photo.src}
              alt=""
              width={photo.width}
              height={photo.height}
              loading={index < 4 ? 'eager' : 'lazy'}
              decoding="async"
              className="h-full w-full object-cover"
            />

            {/* Slivers are darkened so the open photograph is unambiguous —
                a row of equally bright slices reads as a broken layout. */}
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
                'ease-out-brand pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-500',
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
              <span className="text-eyebrow uppercase opacity-80">
                {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
              </span>
              <span className="text-body truncate">{photo.alt}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
