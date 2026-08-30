/**
 * Team — page content. The roster itself is site-level, in `@/data/team.ts`.
 */

export const TEAM_INTRO = {
  eyebrow: 'Team',
  title: 'The people who run it',
  description:
    'A senior core that sets the year, junior core who manage the working teams, and the members who make the drives happen.',
} as const;

export const TEAM_SECTIONS = {
  seniorCore: {
    eyebrow: 'Senior core',
    title: 'Who leads the club',
    description: 'Office bearers and heads for the current term.',
  },
  juniorCore: {
    eyebrow: 'Junior core',
    title: 'Who runs the teams',
    description:
      'The junior core manage the design, development and content teams between them rather than each owning one.',
  },
  members: {
    eyebrow: 'Members',
    title: 'Everyone else who makes it happen',
    description: 'Members join one of three tech teams. Filter to see a team on its own.',
  },
} as const;
