import { PageHero } from '@/components/sections/PageHero';
import { PhasePlaceholder } from '@/components/dev/PhasePlaceholder';

/**
 * Team — outline: hero → "Senior members" → "Junior members".
 *
 * Both bands are the same person-card grid with different data, so one
 * component serves both.
 */
export default function TeamPage() {
  return (
    <>
      <PageHero title="Team" />
      <PhasePlaceholder
        phase="Phase 3+"
        awaiting="Structure confirmed from the outline: Senior members, then Junior members. Awaiting the member-card reference and real member data with photographs."
      />
    </>
  );
}
