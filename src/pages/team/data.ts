/**
 * Team — page content. The roster itself is site-level, in `@/data/team.ts`.
 */

export const TEAM_INTRO = {
  eyebrow: 'Team',
  title: 'The people who run it',
  description:
    'A senior core that sets the year, junior core who lead the working teams, and the members who make the drives happen.',
} as const;

export const TEAM_SECTIONS = {
  seniorCore: {
    eyebrow: 'Senior core',
    title: 'Who leads the club',
  },
  juniorCore: {
    eyebrow: 'Junior core',
    title: 'Who leads the teams',
    description: 'Each working team is led by two junior core members.',
  },
  teams: {
    eyebrow: 'Teams',
    title: 'Where the work happens',
    description:
      'Members are drawn from the club into one of five teams. Leads are named from the junior core above.',
  },
} as const;
