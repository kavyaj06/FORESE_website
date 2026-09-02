import type { TeamId } from './teamIds';
import { CLUB_MEMBERS, type ClubMember, type MemberRank } from './team';

export interface ClubTeam {
  id: TeamId;
  name: string;
  description: string;
}

/** ⚠️ DUMMY descriptions — replace with the club's own wording. */
export const CLUB_TEAMS: ClubTeam[] = [
  {
    id: 'design',
    name: 'Design',
    description: 'Posters, decks, the newsletter layout and this site.',
  },
  {
    id: 'development',
    name: 'Development',
    description: 'The website, internal tooling and the report generation for mock placements.',
  },
  {
    id: 'content',
    name: 'Content',
    description: 'Newsletter writing, event copy, social posts and interview write-ups.',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description:
      'Outreach to companies and students, sponsorships and the club\u2019s public voice.',
  },
  {
    id: 'videography',
    name: 'Videography',
    description: 'Filming and cutting event recaps, aftermovies and the interview reels.',
  },
];

/**
 * Selectors over the roster. Everything derives from `CLUB_MEMBERS`, so
 * nothing about a person or a team is stored twice.
 */

export function membersByRank(rank: MemberRank): ClubMember[] {
  return CLUB_MEMBERS.filter((member) => member.rank === rank);
}

export function membersInTeam(teamId: TeamId): ClubMember[] {
  return CLUB_MEMBERS.filter((member) => member.team === teamId);
}

export function findTeam(id: TeamId): ClubTeam | undefined {
  return CLUB_TEAMS.find((team) => team.id === id);
}

/** Everyone in one of the core ranks, in the order the page shows them. */
export const CORE_RANKS = ['senior-core', 'junior-core', 'lead'] as const;

/** The two ranks that sit on a working team. */
export const MEMBER_RANKS = ['senior-member', 'member'] as const;

export const ROSTER_TOTAL = CLUB_MEMBERS.length;
