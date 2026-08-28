import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container } from '@/components/layout/Container';
import { EVENTS_BY_RECENCY } from '@/data/events';
import { EventAlbum } from '../components/EventAlbum';
import { EventNav } from '../components/EventNav';
import { Lightbox } from '../components/Lightbox';
import { GALLERY_ALBUMS } from '../data';

/**
 * Where an album counts as "the one you are looking at", as a fraction of
 * viewport height. Sits below the sticky header and event nav.
 */
const SPY_LINE = 0.3;

interface OpenPhoto {
  albumIndex: number;
  photoIndex: number;
}

/**
 * The event-wise gallery.
 *
 * Owns the two pieces of state that cannot belong to a single album: which
 * album the sticky nav should highlight, and which photograph the lightbox is
 * showing. Both are properties of the list as a whole — an album can only see
 * itself, so it can never know it should yield to its neighbour.
 */
export function EventwiseGallery() {
  const sectionsRef = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openPhoto, setOpenPhoto] = useState<OpenPhoto | null>(null);

  // Only events that actually have an album, newest first. An event with no
  // photographs should not appear as an empty section or a dead nav chip.
  const albums = useMemo(
    () =>
      EVENTS_BY_RECENCY.map((event) => ({
        event,
        photos: GALLERY_ALBUMS.find((album) => album.eventId === event.id)?.photos ?? [],
      })).filter((entry) => entry.photos.length > 0),
    [],
  );

  const registerSection = useCallback(
    (index: number) => (element: HTMLElement | null) => {
      sectionsRef.current[index] = element;
    },
    [],
  );

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const line = window.innerHeight * SPY_LINE;
      let next = 0;

      sectionsRef.current.forEach((element, index) => {
        if (!element) return;
        if (element.getBoundingClientRect().top <= line) next = index;
      });

      setActiveIndex((previous) => (previous === next ? previous : next));
    };

    // One layout read per frame — scroll fires far more often than the screen
    // repaints, and each measurement reads geometry.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [albums.length]);

  const activeAlbum = openPhoto === null ? null : albums[openPhoto.albumIndex];

  if (albums.length === 0) {
    return (
      <Container className="py-section">
        <p className="text-body text-text-muted">
          Photographs will appear here after the next event.
        </p>
      </Container>
    );
  }

  return (
    <>
      <EventNav
        events={albums.map((entry) => entry.event)}
        activeId={albums[activeIndex]?.event.id ?? null}
      />

      <div className="py-section">
        <Container>
          <div className="gap-3xl flex flex-col">
            {albums.map((entry, albumIndex) => (
              <EventAlbum
                key={entry.event.id}
                event={entry.event}
                photos={entry.photos}
                albumIndex={albumIndex}
                sectionRef={registerSection(albumIndex)}
                onOpenPhoto={(photoIndex) => setOpenPhoto({ albumIndex, photoIndex })}
              />
            ))}
          </div>
        </Container>
      </div>

      <Lightbox
        photos={activeAlbum?.photos ?? null}
        index={openPhoto?.photoIndex ?? 0}
        eventName={activeAlbum?.event.name ?? ''}
        onClose={() => setOpenPhoto(null)}
        onIndexChange={(photoIndex) =>
          setOpenPhoto((current) => (current === null ? current : { ...current, photoIndex }))
        }
      />
    </>
  );
}
