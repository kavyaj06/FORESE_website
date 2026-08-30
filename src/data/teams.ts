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

export const ROSTER_TOTAL = CLUB_MEMBERS.length;
