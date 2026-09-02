import { PageHero } from '@/components/sections/PageHero';
import { CORE_RANKS, membersByRank } from '@/data/teams';
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
          // The three groups the page is divided into, in the order its tabs
          // show them, so the hero says what is below it rather than a
          // different set of facts. Counted off the roster, never stored.
          `${CORE_RANKS.reduce((total, rank) => total + membersByRank(rank).length, 0)} core`,
          `${membersByRank('senior-member').length} senior members`,
          `${membersByRank('member').length} members`,
        ]}
      />
      <TeamBrowser />
    </>
  );
}
