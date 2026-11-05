import { useMemo } from 'react';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { PhotoBand } from '@/components/sections/PhotoBand';
import { Tilt3D } from '@/components/motion/Tilt3D';
import { AlbumCard } from '../components/AlbumCard';
import { ArchiveRow } from '../components/ArchiveRow';
import { PhotoStrip } from '../components/PhotoStrip';
import { closingPhoto, FEATURED_COUNT, galleryIndexEntries, stripPhotos } from '../data';

/**
 * The gallery index.
 *
 * Two treatments, because one cannot serve both ends of the club's lifetime:
 *
 *  - The newest few events get full cover photographs. A gallery whose front
 *    page shows no pictures is the wrong page, and with only a handful of
 *    events a bare list leaves most of the screen empty.
 *  - Everything older falls back to a compact archive list, grouped by year.
 *    Rows are ~72px, so sixty past events stay four screens you can scan
 *    rather than a wall of covers you have to scroll through.
 *
 * The split point is `FEATURED_COUNT`. Below it there is no archive section at
 * all, so a club with three events never sees an empty heading.
 */
/**
 * How many photographs the closing strip holds.
 *
 * Eight across a desktop leaves the open panel wide enough to be a
 * photograph rather than a thumbnail: one at `flex-[6]` beside seven at
 * `flex-[1]` is a little under half the row.
 */
const STRIP_SIZE = 8;

export function GalleryIndex() {
  const entries = useMemo(() => galleryIndexEntries(), []);
  const featured = entries.slice(0, FEATURED_COUNT);
  const archived = entries.slice(FEATURED_COUNT);

  const years = useMemo(() => {
    const grouped = new Map<number, typeof archived>();
    for (const entry of archived) {
      // An undated event has not happened, so it has no photographs to file
      // under a year. It cannot reach here, and is skipped rather than
      // given an invented date.
      if (!entry.event.date) continue;
      const year = new Date(entry.event.date).getFullYear();
      grouped.set(year, [...(grouped.get(year) ?? []), entry]);
    }
    return [...grouped.entries()].sort((a, b) => b[0] - a[0]);
  }, [archived]);

  if (entries.length === 0) {
    return (
      <Container className="py-section">
        <p className="text-body text-text-muted">
          Photographs will appear here after the next event.
        </p>
      </Container>
    );
  }

  let position = featured.length;

  const closing = closingPhoto();
  const strip = stripPhotos(STRIP_SIZE);
  const photoCount = entries.reduce((total, entry) => total + entry.photoCount, 0);

  return (
    <section className="pt-section">
      <Container className="pb-section">
        {/* One size, evenly spaced, at the club's request. The leading event
            used to run full width with the next two paired beneath it, which
            gave the album at the front of the list several times the weight of
            the ones behind it — and since Mock Placements is pinned there, it
            was always the same album getting it. They are all the club's
            events; the grid says so now.

            The first card still loads eagerly: it is the one above the fold,
            and waiting for the lazy loader to notice it is a blank rectangle
            on arrival. */}
        <div className="gap-lg tablet:grid-cols-2 desktop:grid-cols-3 grid">
          {featured.map((entry, index) => (
            <Reveal key={entry.event.id} motionStyle="scale">
              {/* Three instances, pointer only, already off on touch and
                  under reduced motion — so the cost is nil and the index
                  gains the one interaction it had none of. Gentler than the
                  events list's: these cards are much larger, and the same
                  degrees across a bigger rectangle swings the far corner
                  several times as far. */}
              <Tilt3D max={4} perspective={1400} liftZ={18} className="h-full">
                <AlbumCard entry={entry} size="standard" eager={index === 0} />
              </Tilt3D>
            </Reveal>
          ))}
        </div>

        {archived.length > 0 && (
          <div className="mt-3xl">
            <Reveal>
              <SectionHeading as="h2" eyebrow="Archive" title="Earlier events" />
            </Reveal>

            <div className="mt-xl">
              {years.map(([year, group]) => (
                <div key={year} className="mb-2xl last:mb-0">
                  {/* top-16 clears the sticky site header. */}
                  <h3 className="text-eyebrow text-text-subtle border-border bg-bg/90 sticky top-16 z-20 border-b py-3 uppercase backdrop-blur-md">
                    {year}
                  </h3>

                  <ul>
                    {group.map((entry) => {
                      position += 1;
                      return (
                        <Reveal key={entry.event.id} as="li">
                          <ArchiveRow
                            event={entry.event}
                            cover={entry.cover}
                            photoCount={entry.photoCount}
                            index={position}
                          />
                        </Reveal>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* The page's closing frame. Three cover cards on white was the whole
          of the gallery index, which made the one page on this site that is
          about photographs the one with the least photograph on it.

          Two of them, for two input devices rather than a layout and a
          fallback — the same split the album pages make. The strip is a
          hover interaction and only exists where there is a pointer; a phone
          gets the full-bleed band, which is the better closing frame there
          anyway. Each hides itself at the other's width. */}
      {strip.length > 1 && (
        <Container className="pb-section">
          <PhotoStrip items={strip} />
        </Container>
      )}

      {closing?.src && (
        <PhotoBand
          photo={{
            src: closing.src,
            alt: closing.alt,
            width: closing.width,
            height: closing.height,
          }}
          caption={`${photoCount} photographs across ${entries.length} ${
            entries.length === 1 ? 'event' : 'events'
          }.`}
          size="tall"
          className="desktop:hidden"
        />
      )}
    </section>
  );
}
