import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { PhotoTile } from '../components/PhotoTile';
import { Lightbox } from '../components/Lightbox';
import type { GalleryPhoto } from '../data';

interface AlbumGridProps {
  photos: GalleryPhoto[];
  eventName: string;
}

/**
 * One album's photographs.
 *
 * Multi-column rather than a row grid: event photographs come in whatever
 * shape the camera was held, and a row grid forces one aspect ratio — either
 * cropping faces out or leaving gaps. Columns let every picture keep its own
 * proportions and still tile without holes.
 *
 * Owns the lightbox because which photograph is open is a property of the
 * album, not of any one tile.
 */
export function AlbumGrid({ photos, eventName }: AlbumGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-section">
      <Container>
        <div className="gap-lg tablet:columns-2 desktop:columns-3 [&>*]:mb-lg columns-1 [&>*]:break-inside-avoid">
          {photos.map((photo, index) => (
            <Reveal key={photo.id} delay={(index % 3) * 0.07} motionStyle="scale">
              <PhotoTile
                photo={photo}
                position={index + 1}
                total={photos.length}
                eventName={eventName}
                onOpen={() => setOpenIndex(index)}
                eager={index < 3}
              />
            </Reveal>
          ))}
        </div>
      </Container>

      <Lightbox
        photos={openIndex === null ? null : photos}
        index={openIndex ?? 0}
        eventName={eventName}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </section>
  );
}
