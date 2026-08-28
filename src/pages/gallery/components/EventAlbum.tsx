import { Reveal } from '@/components/motion/Reveal';
import { formatEventDate, type ForeseEvent } from '@/data/events';
import { PhotoTile } from './PhotoTile';
import type { GalleryPhoto } from '../data';

interface EventAlbumProps {
  event: ForeseEvent;
  photos: GalleryPhoto[];
  /** Album position on the page — the first one's images load eagerly. */
  albumIndex: number;
  onOpenPhoto: (photoIndex: number) => void;
  /** Lets the parent measure this album for the sticky nav's active state. */
  sectionRef?: (element: HTMLElement | null) => void;
}

/**
 * One event's photographs.
 *
 * The grid is CSS multi-column rather than a row grid. Event photographs come
 * in whatever shape the camera was held, and a row grid forces them all into
 * one aspect ratio — either cropping faces out or leaving gaps. Columns let
 * every picture keep its own proportions and still tile without holes.
 *
 * `scroll-mt` clears both the site header and the sticky event nav, so a jump
 * link does not land with the heading hidden underneath them.
 */
export function EventAlbum({
  event,
  photos,
  albumIndex,
  onOpenPhoto,
  sectionRef,
}: EventAlbumProps) {
  return (
    <section
      ref={sectionRef}
      id={event.slug}
      aria-labelledby={`${event.slug}-heading`}
      className="scroll-mt-36"
    >
      <Reveal>
        <header className="gap-xs border-border mb-xl pb-lg flex flex-col border-b">
          <p className="text-eyebrow text-text-subtle uppercase">
            {formatEventDate(event.date)} · {photos.length}{' '}
            {photos.length === 1 ? 'photo' : 'photos'}
          </p>
          <h2 id={`${event.slug}-heading`} className="text-h2">
            {event.name}
          </h2>
          {event.blurb && (
            <p className="text-body text-text-muted max-w-content-narrow">{event.blurb}</p>
          )}
        </header>
      </Reveal>

      <div className="gap-lg tablet:columns-2 desktop:columns-3 [&>*]:mb-lg columns-1 [&>*]:break-inside-avoid">
        {photos.map((photo, index) => (
          // Each tile reveals on its own rather than as one album-wide
          // stagger: an album is taller than the screen, so a single stagger
          // would finish before you scrolled to the later tiles. The small
          // index-based delay still gives a cascade within a row.
          <Reveal key={photo.id} delay={(index % 3) * 0.06}>
            <PhotoTile
              photo={photo}
              position={index + 1}
              total={photos.length}
              eventName={event.name}
              onOpen={() => onOpenPhoto(index)}
              eager={albumIndex === 0 && index < 3}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
