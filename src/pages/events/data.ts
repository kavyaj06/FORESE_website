/**
 * Events — page content.
 *
 * Only the page's own copy lives here. The events themselves are site-level,
 * in `@/data/events.ts`, because the gallery and the home page name the same
 * ones.
 */

export const EVENTS_INTRO = {
  eyebrow: 'Events',
  title: 'What the club runs.',
  description:
    'From workshops and corporate sessions to placement drives and community events — see what\u2019s happening now, what\u2019s coming up, and what we\u2019ve already done.',
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
