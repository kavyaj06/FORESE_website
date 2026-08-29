import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { AlbumAccordion } from '../components/AlbumAccordion';
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
 * Two layouts for two input devices, not a layout and a fallback:
 *
 *  - Desktop gets the accordion strip. It is a hover interaction, so it only
 *    exists where there is a pointer to hover with.
 *  - Narrow screens get the multi-column masonry. Event photographs come in
 *    whatever shape the camera was held, and columns let each keep its own
 *    proportions and still tile without holes.
 *
 * Both open the same Lightbox, and this component owns it — which photograph
 * is open is a property of the album, not of any one tile.
 */
export function AlbumGrid({ photos, eventName }: AlbumGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-section">
      <Container>
        <Reveal>
          <AlbumAccordion photos={photos} eventName={eventName} onOpen={setOpenIndex} />
        </Reveal>

        <div className="gap-lg desktop:hidden tablet:columns-2 [&>*]:mb-lg columns-1 [&>*]:break-inside-avoid">
          {photos.map((photo, index) => (
            <Reveal key={photo.id} delay={(index % 2) * 0.07} motionStyle="scale">
              <PhotoTile
                photo={photo}
                position={index + 1}
                total={photos.length}
                eventName={eventName}
                onOpen={() => setOpenIndex(index)}
                eager={index < 2}
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
