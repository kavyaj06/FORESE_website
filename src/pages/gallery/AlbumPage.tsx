import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/sections/PageHero';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui';
import { EVENTS_BY_RECENCY, findEventBySlug, formatEventDate } from '@/data/events';
import { AlbumGrid } from './sections/AlbumGrid';
import { albumFor } from './data';

/**
 * One event's album, at its own URL.
 *
 * Splitting albums onto their own pages is what makes the gallery survive a
 * few years of events: the index stays a scannable list, and a page only ever
 * loads the photographs of the event being looked at. It also means a single
 * event's album can be linked to directly, which is what actually gets shared.
 */
export default function AlbumPage() {
  const { slug } = useParams();
  const event = slug ? findEventBySlug(slug) : undefined;
  const photos = event ? (albumFor(event.id)?.photos ?? []) : [];

  if (!event || photos.length === 0) {
    return (
      <>
        <PageHero
          eyebrow="Gallery"
          title="Album not found"
          description="This event has no photographs on the site."
          size="compact"
        />
        <Container className="py-section">
          <Button to="/gallery" iconLeft={<ArrowLeft size={16} aria-hidden="true" />}>
            All events
          </Button>
        </Container>
      </>
    );
  }

  // Neighbours in the same order the index presents, so "next" means the same
  // thing in both places.
  const withAlbums = EVENTS_BY_RECENCY.filter(
    (candidate) => (albumFor(candidate.id)?.photos.length ?? 0) > 0,
  );
  const position = withAlbums.findIndex((candidate) => candidate.id === event.id);
  const next = withAlbums[position + 1];

  return (
    <>
      <PageHero
        eyebrow={formatEventDate(event.date)}
        title={event.name}
        description={event.blurb}
        size="compact"
        meta={[`${photos.length} photographs`]}
      />

      <AlbumGrid photos={photos} eventName={event.name} />

      <Container className="pb-section">
        <div className="border-border gap-md pt-lg flex flex-wrap items-center justify-between border-t">
          <Link
            to="/gallery"
            className="text-label text-text-muted hover:text-text gap-xs duration-fast group inline-flex items-center transition-colors"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
              className="duration-fast transition-transform group-hover:-translate-x-0.5"
            />
            All events
          </Link>

          {next && (
            <Link
              to={`/gallery/${next.slug}`}
              className="text-label gap-xs duration-fast group inline-flex items-center transition-colors"
            >
              <span className="text-text-muted">Next</span>
              <span className="text-text">{next.name}</span>
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="duration-fast transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </div>
      </Container>
    </>
  );
}
