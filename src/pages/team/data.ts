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
  { id: 'senior-executive', label: 'Senior Executives' },
] as const;

/**
 * The two stacks of cards on the core tabs.
 *
 * `{count}` and `{post}` are filled at render. The hint is about what to do
 * rather than what the thing is: a fanned stack of cards does not announce
 * that it can be clicked, and on a pointer device it can also be flicked
 * upward, which nobody guesses.
 */
export const TEAM_FAN = {
  title: 'The postings',
  lead: 'Every role the club elects, and who holds it.',
  hint: 'Pick a card to meet the people in that posting.',
  close: 'Close',
  openPost: '{post}, show {count} people',
  openPostOne: '{post}, show 1 person',
  noPost: 'Core',
} as const;

/** The membership gallery under the Senior Members and Members tabs. */
export const TEAM_GALLERY = {
  pick: 'Show {name}',
  teamsLabel: 'Teams',
  /**
   * What goes under the name when a person holds no title.
   *
   * Most of the roster holds none: a title belongs to the core, and the 140
   * people in the two member ranks are identified by the rank itself.
   * Printing "Member" under all of them would call a senior member the wrong
   * thing.
   */
  ranks: {
    'senior-member': 'Senior Member',
    member: 'Member',
  } as Record<string, string>,
  noRole: 'Member',
} as const;
