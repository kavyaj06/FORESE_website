/**
 * Team — page content. The roster itself is site-level, in `@/data/team.ts`.
 */

export const TEAM_INTRO = {
  eyebrow: 'Team',
  title: 'The people behind FORESE',
} as const;

/**
 * Section titles only — no eyebrow, no description. The rank names are the
 * title, so the section says what it is without a kicker line repeating it or
 * a sentence explaining it underneath.
 */
export const TEAM_SECTIONS = {
  seniorCore: {
    title: 'Senior Core',
  },
  juniorCore: {
    title: 'Junior Core',
  },
  members: {
    title: 'Members',
  },
} as const;
