import { useMemo, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { EVENTS_BY_RECENCY, type ForeseEvent } from '@/data/events';
import { ArchiveRow } from '../components/ArchiveRow';
import { HoverPreview } from '../components/HoverPreview';
import { albumFor, coverPhoto, type GalleryPhoto } from '../data';

interface ArchiveEntry {
  event: ForeseEvent;
  cover?: GalleryPhoto;
  photoCount: number;
}

/**
 * The gallery index: every event with photographs, as a year-grouped archive.
 *
 * Why a list and not a grid of cards. A club accumulates events indefinitely,
 * and at twenty-plus a card grid becomes a wall you scroll rather than an
 * index you scan. Rows are ~72px, so sixty events is roughly four screens and
 * every event name is readable without hunting. The photographs are still the
 * point — they arrive in the cursor preview.
 *
 * Year headings stick, so it is always clear which year is on screen. That is
 * what replaces the chip bar, which could only ever show the first handful of
 * events before hiding the rest off the edge of the strip.
 */
export function EventArchive() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  // A cursor preview is meaningless without a cursor. Touch devices get the
  // inline thumbnail on each row instead.
  const hasPointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  const years = useMemo(() => {
    const entries: ArchiveEntry[] = EVENTS_BY_RECENCY.map((event) => ({
      event,
      cover: coverPhoto(event.id),
      photoCount: albumFor(event.id)?.photos.length ?? 0,
    })).filter((entry) => entry.photoCount > 0);

    const grouped = new Map<number, ArchiveEntry[]>();
    for (const entry of entries) {
      const year = new Date(entry.event.date).getFullYear();
      grouped.set(year, [...(grouped.get(year) ?? []), entry]);
    }

    return [...grouped.entries()].sort((a, b) => b[0] - a[0]);
  }, []);

  const hoveredPhoto = hoveredId ? (coverPhoto(hoveredId) ?? null) : null;

  if (years.length === 0) {
    return (
      <Container className="py-section">
        <p className="text-body text-text-muted">
          Photographs will appear here after the next event.
        </p>
      </Container>
    );
  }

  let position = 0;

  return (
    <section
      className="py-section"
      onPointerMove={(event) => {
        if (!hasPointer) return;
        pointerX.set(event.clientX);
        pointerY.set(event.clientY);
      }}
    >
      <Container>
        {years.map(([year, entries]) => (
          <div key={year} className="mb-2xl last:mb-0">
            {/* top-16 clears the sticky site header. */}
            <h2 className="text-eyebrow text-text-subtle border-border bg-bg/90 sticky top-16 z-20 border-b py-3 uppercase backdrop-blur-md">
              {year}
            </h2>

            <ul>
              {entries.map((entry) => {
                position += 1;
                return (
                  <Reveal key={entry.event.id} as="li">
                    <ArchiveRow
                      event={entry.event}
                      cover={entry.cover}
                      photoCount={entry.photoCount}
                      index={position}
                      onHoverStart={() => setHoveredId(entry.event.id)}
                      onHoverEnd={() => setHoveredId(null)}
                    />
                  </Reveal>
                );
              })}
            </ul>
          </div>
        ))}
      </Container>

      {hasPointer && <HoverPreview photo={hoveredPhoto} pointerX={pointerX} pointerY={pointerY} />}
    </section>
  );
}
