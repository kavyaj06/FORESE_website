import { PageHero } from '@/components/sections/PageHero';
import { PhasePlaceholder } from '@/components/dev/PhasePlaceholder';

/**
 * Mock Placements — Phase 1, the first page to be built.
 *
 * When built, this component stays a readable table of contents: it composes
 * sections from `./sections/` and passes them content from `./data.ts`. No
 * copy or layout detail lives inline here.
 */
export default function MockPlacementsPage() {
  return (
    <>
      <PageHero
        title="Mock Placement"
        />
      <PhasePlaceholder
        phase="Phase 1"
        awaiting="Structure confirmed from the outline: a hero, then a six-step vertical timeline — Contact collection, HR calling, Aptitude, Group Discussion, Allocation, Mock placements. Awaiting the anchor template and a timeline reference."
      />
    </>
  );
}
