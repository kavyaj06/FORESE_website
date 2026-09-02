/**
 * Team — page content. The roster itself is site-level, in `@/data/team.ts`.
 */

export const TEAM_INTRO = {
  eyebrow: 'Team',
  title: 'The people behind FORESE',
} as const;

/**
 * The two rows of tabs, in the order they are shown.
 *
 * Labels only — the counts beside them are read off the roster, never stored
 * here. A count in this file is a second copy of a fact `CLUB_MEMBERS` already
 * holds, and the two would part company the first time someone joins.
 *
 * There are no section titles any more because there are no longer sections:
 * the selected tab is the heading, and repeating it underneath would say the
 * same word twice.
 */
export const TEAM_GROUP_TABS = [
  { id: 'core', label: 'Core Members' },
  { id: 'senior-member', label: 'Senior Members' },
  { id: 'member', label: 'Members' },
] as const;

export const TEAM_CORE_TABS = [
  { id: 'senior-core', label: 'Senior Core' },
  { id: 'junior-core', label: 'Junior Core' },
  { id: 'lead', label: 'Leads' },
] as const;
