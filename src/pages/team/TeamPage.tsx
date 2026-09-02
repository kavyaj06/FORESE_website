import { PageHero } from '@/components/sections/PageHero';
import { CLUB_TEAMS, membersByRank, ROSTER_TOTAL } from '@/data/teams';
import { TeamBrowser } from './sections/TeamBrowser';
import { TEAM_INTRO } from './data';

/**
 * Team.
 *
 * Five ranks and five working teams, all read from one roster, behind the two
 * rows of tabs in `TeamBrowser`. A person is stored once and rendered once,
 * which is what stops the same face appearing in two places — a property of
 * the data rather than something the layout has to keep remembering.
 */
export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow={TEAM_INTRO.eyebrow}
        title={TEAM_INTRO.title}
        size="compact"
        meta={[
          `${membersByRank('senior-core').length + membersByRank('junior-core').length + membersByRank('lead').length} core`,
          `${CLUB_TEAMS.length} working teams`,
          `${ROSTER_TOTAL} in total`,
        ]}
      />
      <TeamBrowser />
    </>
  );
}
