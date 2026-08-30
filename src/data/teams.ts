import type { TeamId } from './teamIds';

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
    description:
      'Everything the club looks like — posters, decks, the newsletter layout and this site.',
  },
  {
    id: 'content',
    name: 'Content',
    description: 'Newsletter writing, event copy, social posts and the interview write-ups.',
  },
  {
    id: 'corporate',
    name: 'Corporate Relations',
    description: 'Finding HR contacts, calling companies and confirming interview panels.',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Running the drives on the day: venues, scheduling, registration and logistics.',
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'The website, the registration tooling and the report generation for mock drives.',
  },
];

import { CLUB_MEMBERS, type ClubMember } from './team';

/**
 * Selectors over the roster.
 *
 * Every one of these derives from `CLUB_MEMBERS`. Nothing about a team is
 * stored twice, so a person added to the roster appears in their team without
 * anyone editing a second list.
 */

export function membersByRank(rank: ClubMember['rank']): ClubMember[] {
  return CLUB_MEMBERS.filter((member) => member.rank === rank);
}

export function teamLeads(teamId: TeamId): ClubMember[] {
  return CLUB_MEMBERS.filter((member) => member.leadsTeam === teamId);
}

/** Everyone on a team who is not one of its leads. */
export function teamMembers(teamId: TeamId): ClubMember[] {
  return CLUB_MEMBERS.filter((member) => member.team === teamId && !member.leadsTeam);
}

/** Members belonging to no team at all — rendered so nobody is left off. */
export function unassignedMembers(): ClubMember[] {
  return CLUB_MEMBERS.filter((member) => member.rank === 'member' && !member.team);
}

export function findTeam(id: TeamId): ClubTeam | undefined {
  return CLUB_TEAMS.find((team) => team.id === id);
}

export const ROSTER_TOTAL = CLUB_MEMBERS.length;
