import { PageHero } from '@/components/sections/PageHero';
import { membersByRank, ROSTER_TOTAL } from '@/data/teams';
import { CoreSection } from './sections/CoreSection';
import { TeamsSection } from './sections/TeamsSection';
import { TEAM_INTRO } from './data';

/**
 * Team.
 *
 * Three ranks and five working teams, all read from one roster. A person is
 * stored once and rendered once: core members as portrait cards, everyone else
 * as a name inside their team. That is what stops the same face appearing in
 * two places, and it is a property of the data rather than something the
 * layout has to keep remembering.
 */
export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow={TEAM_INTRO.eyebrow}
        title={TEAM_INTRO.title}
        description={TEAM_INTRO.description}
        size="compact"
        meta={[
          `${membersByRank('senior-core').length} senior core`,
          `${membersByRank('junior-core').length} junior core`,
          `${ROSTER_TOTAL} in total`,
        ]}
      />
      <CoreSection />
      <TeamsSection />
    </>
  );
}
