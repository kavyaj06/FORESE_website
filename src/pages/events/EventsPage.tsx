import { PageHero } from '@/components/sections/PageHero';
import { PhasePlaceholder } from '@/components/dev/PhasePlaceholder';

/**
 * Events — outline: hero → "Upcoming Events" → "Completed Events".
 *
 * The Upcoming Events band also appears on the home page, so it becomes a
 * shared section rather than living here.
 */
export default function EventsPage() {
  return (
    <>
      <PageHero title="Events" />
      <PhasePlaceholder
        phase="Phase 3+"
        awaiting="Structure confirmed from the outline: Upcoming Events, then Completed Events. Awaiting the visual reference for the event card and section band."
      />
    </>
  );
}
