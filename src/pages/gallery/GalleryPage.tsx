import { PageHero } from '@/components/sections/PageHero';
import { PhasePlaceholder } from '@/components/dev/PhasePlaceholder';

/**
 * Gallery — Phase 2.
 *
 * The lightbox will use the shared `Modal` primitive rather than a
 * gallery-specific overlay, so focus handling and scroll locking are solved
 * once for the whole site.
 */
export default function GalleryPage() {
  return (
    <>
      <PageHero title="Gallery" />
      <PhasePlaceholder
        phase="Phase 2"
        awaiting="Structure confirmed from the outline: a hero, then an event-wise gallery. Awaiting the grid reference and the real event photographs."
      />
    </>
  );
}
