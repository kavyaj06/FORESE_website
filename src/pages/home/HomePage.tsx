import { PageHero } from '@/components/sections/PageHero';
import { PhasePlaceholder } from '@/components/dev/PhasePlaceholder';

/**
 * Landing page.
 *
 * Built after Mock Placements and Gallery, per the agreed phase order.
 */
export default function HomePage() {
  return (
    <>
      <PageHero title="Forese" />
      <PhasePlaceholder
        phase="Phase 3+"
        awaiting="Structure confirmed from the outline: a hero, then a two-column split of Upcoming Events and Announcements. Awaiting the visual reference."
      />
    </>
  );
}
