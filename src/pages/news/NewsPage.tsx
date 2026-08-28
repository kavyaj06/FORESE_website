import { PageHero } from '@/components/sections/PageHero';
import { PhasePlaceholder } from '@/components/dev/PhasePlaceholder';

/**
 * News — outline: hero → "Newsletter" → "News Automation".
 */
export default function NewsPage() {
  return (
    <>
      <PageHero title="News" />
      <PhasePlaceholder
        phase="Phase 3+"
        awaiting="Structure confirmed from the outline: Newsletter, then News Automation. Both need clarification on what they contain before they can be built."
      />
    </>
  );
}
