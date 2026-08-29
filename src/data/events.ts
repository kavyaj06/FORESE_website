/**
 * The club's events — site-level, not page-level.
 *
 * This is the one deliberate exception to "content lives in the page's own
 * data.ts". The same events are named by the Gallery (which groups photographs
 * under them), the Events page, and the Home page's upcoming panel. Three
 * copies of the same list would drift apart within a term.
 *
 * ⚠️ PLACEHOLDER — the events below are stand-ins so the gallery can be
 * designed and reviewed. Replace the whole list with the club's real events.
 */

export interface ForeseEvent {
  /** Stable id. Referenced by the gallery's photo manifest. */
  id: string;
  /** URL-safe name. Used for anchors and image folder names. */
  slug: string;
  name: string;
  /** ISO 8601 date. Sorted and formatted from this, never from a display string. */
  date: string;
  /** One line of context, shown under the name in the gallery. */
  blurb?: string;
}

export const EVENTS: ForeseEvent[] = [
  // DUMMY upcoming entries. Every real event we have is in the past, so the
  // home page's "Upcoming" panel would otherwise be permanently empty and
  // impossible to design against.
  {
    id: 'mock-placement-drive-2026',
    slug: 'mock-placement-drive-2026',
    name: 'Mock Placement Drive 2026',
    date: '2026-09-19',
    blurb: 'The full rehearsal — aptitude, group discussion and interview panels.',
  },
  {
    id: 'corporate-connect-2026',
    slug: 'corporate-connect-2026',
    name: 'Corporate Connect 2026',
    date: '2026-10-10',
    blurb: 'Recruiters and alumni on what they actually look for in a candidate.',
  },
  {
    id: 'mock-placement-drive-2025',
    slug: 'mock-placement-drive-2025',
    name: 'Mock Placement Drive 2025',
    date: '2025-09-20',
    blurb: 'Aptitude, group discussions and interview panels run across a single weekend.',
  },
  {
    id: 'corporate-connect-2025',
    slug: 'corporate-connect-2025',
    name: 'Corporate Connect',
    date: '2025-08-02',
    blurb: 'Recruiters and alumni on what they actually look for in a candidate.',
  },
  {
    id: 'guest-lecture-series-2025',
    slug: 'guest-lecture-series-2025',
    name: 'Guest Lecture Series',
    date: '2025-04-12',
    blurb: 'Industry speakers hosted through the term.',
  },
  {
    id: 'orientation-2025',
    slug: 'orientation-2025',
    name: 'Freshers Orientation',
    date: '2025-02-08',
    blurb: 'Introducing the club and the year ahead to the incoming batch.',
  },
];

/** Events newest first — the order the gallery and events page both present. */
export const EVENTS_BY_RECENCY: ForeseEvent[] = [...EVENTS].sort((a, b) =>
  b.date.localeCompare(a.date),
);

/**
 * Events still to come, soonest first.
 *
 * Compared against the current date at render rather than a hardcoded flag, so
 * an event moves from Upcoming to Completed on its own and nobody has to
 * remember to edit anything the morning after.
 */
export function upcomingEvents(now: Date = new Date()): ForeseEvent[] {
  const today = now.toISOString().slice(0, 10);
  return EVENTS.filter((event) => event.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

export function findEvent(id: string): ForeseEvent | undefined {
  return EVENTS.find((event) => event.id === id);
}

export function findEventBySlug(slug: string): ForeseEvent | undefined {
  return EVENTS.find((event) => event.slug === slug);
}

/**
 * Formats an event date for display.
 *
 * Centralised so every surface writes dates the same way, and so the locale is
 * a single decision rather than one made independently in four components.
 */
export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}
