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
export const CORE_RANKS = ['senior-core', 'junior-core', 'lead', 'senior-executive'] as const;

/**
 * How the roles inside one rank are ordered on the page.
 *
 * Sorted rather than hand-arranged in `CLUB_MEMBERS`, because the array's
 * order is the order people were typed in and nothing keeps that meaningful:
 * the senior core rendered with the President sixth, between two general
 * secretaries. A precedence list cannot drift when somebody is added.
 *
 * A role missing from this list sorts last, alphabetically with everyone else
 * the list does not name. That is deliberate — an unknown role should appear,
 * not vanish — but it is also why every role the roster actually uses is
 * written here: left out, Tech Head and Treasurer land in the same bucket and
 * interleave.
 */
const ROLE_ORDER = [
  'President',
  'Vice President',
  'General Secretary',
  'Executive Director',
  'Tech Head',
  'Communications Chair',
  'Treasurer',
  'Marketing Lead',
  'Design Lead',
  'Videography Lead',
  'Senior Marketing Executive',
  'Senior Design Executive',
  'Senior Videography Executive',
];

/**
 * The order people are shown in: by role, then by name.
 *
 * Both halves are load-bearing. Role first, because a senior core listed
 * alphabetically would open on a general secretary and bury the President in
 * the middle — the order is information there. Name second, because for the
 * hundred and forty people who carry no role at all it is the only order a
 * reader can navigate: they are looking for one person, and a list arranged
 * by nothing is a list you have to read all of.
 *
 * Alphabetical by the whole name, which reads as alphabetical by first name
 * now that the roster writes initials last ("Anirrudh D", not "D Anirrudh").
 * That is the point of writing them that way: sorted under the initial, a
 * fifth of the members sat in a block of A's, D's and S's that had nothing to
 * do with what anyone is called.
 */
export function byRoleThenName(a: ClubMember, b: ClubMember): number {
  const rank = (member: ClubMember) => {
    const at = member.role ? ROLE_ORDER.indexOf(member.role) : -1;
    return at === -1 ? ROLE_ORDER.length : at;
  };
  return rank(a) - rank(b) || a.name.localeCompare(b.name);
}

/** The two ranks that sit on a working team. */
export const MEMBER_RANKS = ['senior-member', 'member'] as const;

export const ROSTER_TOTAL = CLUB_MEMBERS.length;
