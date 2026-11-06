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
    'From workshops and corporate sessions to placement drives and community events. See what\u2019s happening now, what\u2019s coming up, and what we\u2019ve already done.',
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

/**
 * The words on an event's own page.
 *
 * Only the furniture is here. What an event *says* — its headline, its
 * paragraphs, its reasons to attend — is on the event itself in
 * `@/data/events`, because the club edits that in the club editor and this
 * file is not reachable from there.
 */
export const EVENT_PAGE = {
  back: 'All events',
  next: 'Next',
  /** Used when an event has no `aboutTitle` of its own. */
  aboutFallback: 'What it is',
  /** "Why attend FORED?" — the acronym, not the registered name in full. */
  why: (short: string) => `Why attend ${short}?`,
  audienceLabel: 'Who it is for',
  venueLabel: 'Where',
  photos: 'photographs',
  /** Follows the count on the row: "Details". */
  rowAction: 'Details',
  missing: {
    eyebrow: 'Events',
    title: 'Event not found',
    description: 'There is nothing at this address. It may have been renamed.',
  },
} as const;
