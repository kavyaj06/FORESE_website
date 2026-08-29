import { useMemo } from 'react';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { AlbumCard } from '../components/AlbumCard';
import { ArchiveRow } from '../components/ArchiveRow';
import { FEATURED_COUNT, galleryIndexEntries } from '../data';

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
export function GalleryIndex() {
  const entries = useMemo(() => galleryIndexEntries(), []);
  const featured = entries.slice(0, FEATURED_COUNT);
  const archived = entries.slice(FEATURED_COUNT);

  const years = useMemo(() => {
    const grouped = new Map<number, typeof archived>();
    for (const entry of archived) {
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

  return (
    <section className="py-section">
      <Container>
        {/* Featured — the leading event runs full width, the next two pair up
            beneath it. An even grid of three would give the most recent event
            no more weight than the one before it. */}
        <div className="gap-lg flex flex-col">
          {featured[0] && (
            <Reveal motionStyle="scale">
              <AlbumCard entry={featured[0]} size="feature" eager />
            </Reveal>
          )}

          {featured.length > 1 && (
            <div className="gap-lg tablet:grid-cols-2 grid">
              {featured.slice(1).map((entry) => (
                <Reveal key={entry.event.id} motionStyle="scale">
                  <AlbumCard entry={entry} size="standard" />
                </Reveal>
              ))}
            </div>
          )}
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
    </section>
  );
}
