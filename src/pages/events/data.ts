/**
 * Events — page content.
 *
 * Only the page's own copy lives here. The events themselves are site-level,
 * in `@/data/events.ts`, because the gallery and the home page name the same
 * ones.
 */

export const EVENTS_INTRO = {
  eyebrow: 'Events',
  title: 'Everything the club runs',
  description:
    'Mock placements, corporate sessions and workshops — what is running now, what is coming, and everything already done.',
} as const;

export const EVENT_GROUPS = {
  ongoing: {
    eyebrow: 'Ongoing',
    title: 'Ongoing events',
  },
  upcoming: {
    eyebrow: 'Upcoming',
    title: 'What is next',
    empty: 'Nothing scheduled yet. The next event is announced here first.',
  },
  completed: {
    eyebrow: 'Archive',
    title: 'Already done',
    empty: 'Completed events will be listed here.',
  },
} as const;
