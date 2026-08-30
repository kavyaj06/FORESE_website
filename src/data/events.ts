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
  /**
   * ISO 8601 start date, or `null` when the date has not been announced yet.
   *
   * Null is a real state, not missing data: the club announces an event long
   * before it fixes a date, and those still belong on the events page. Making
   * it nullable forces every consumer to decide what to show, which is why
   * nothing renders an empty date cell.
   */
  date: string | null;
  /** ISO end date for events that run over several days. Omit for single-day. */
  endDate?: string;
  /** One line of context. */
  blurb?: string;
  /**
   * Cover image under `public/`, used by the events page cards and carousel.
   * ⚠️ DUMMY files today — generated abstracts, not photographs.
   */
  cover?: string;
  /** Where it happens. Shown on the cards. */
  venue?: string;
}

/**
 * Where an event sits in time.
 *
 * Derived from the dates at render, never stored. A status field would have to
 * be changed by hand on the right morning, and it would be wrong the first
 * time somebody forgot.
 */
export type EventStatus = 'upcoming' | 'ongoing' | 'completed';

export function eventStatus(event: ForeseEvent, now: Date = new Date()): EventStatus {
  // Announced but undated events are still ahead of us.
  if (!event.date) return 'upcoming';

  const today = now.toISOString().slice(0, 10);
  const end = event.endDate ?? event.date;

  if (today < event.date) return 'upcoming';
  if (today <= end) return 'ongoing';
  return 'completed';
}

/** Every event split by status: upcoming soonest first, completed newest first. */
export function groupEventsByStatus(now: Date = new Date()): Record<EventStatus, ForeseEvent[]> {
  const groups: Record<EventStatus, ForeseEvent[]> = {
    ongoing: [],
    upcoming: [],
    completed: [],
  };

  for (const event of EVENTS) {
    groups[eventStatus(event, now)].push(event);
  }

  // Undated events sort last within Upcoming — a confirmed date is more useful
  // to a student than one that is still being arranged.
  groups.upcoming.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });
  groups.ongoing.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  groups.completed.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  return groups;
}

/**
 * How the date reads on screen, including the two cases a plain formatter
 * cannot express: no date at all, and an event spanning several days.
 */
export function formatEventWhen(event: ForeseEvent): string {
  if (!event.date) return 'Date to be announced';
  if (!event.endDate || event.endDate === event.date) return formatEventDate(event.date);

  const start = new Date(event.date);
  const end = new Date(event.endDate);
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();

  // "19–21 September 2026" rather than repeating the month and year twice.
  if (sameMonth) {
    return `${start.getDate()}\u2013${formatEventDate(event.endDate)}`;
  }
  return `${formatEventDate(event.date)} \u2013 ${formatEventDate(event.endDate)}`;
}

/**
 * "in 3 weeks", "tomorrow". Null when there is no date to count towards.
 *
 * Chooses its unit by distance: days are meaningless at six months out, and
 * months are useless the day before.
 */
export function relativeWhen(event: ForeseEvent, now: Date = new Date()): string | null {
  if (!event.date) return null;

  const startOfDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round(
    (new Date(event.date + 'T00:00:00Z').getTime() - startOfDay(now)) / 86_400_000,
  );
  if (days < 0) return null;

  const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (days < 14) return format.format(days, 'day');
  if (days < 60) return format.format(Math.round(days / 7), 'week');
  return format.format(Math.round(days / 30), 'month');
}

export const EVENTS: ForeseEvent[] = [
  // DUMMY entries covering every state the events page has to render: one
  // running now, one dated and ahead, and one announced without a date. The
  // real list is all in the past, so none of these states could be designed
  // against otherwise.
  {
    id: 'resume-clinic-2026',
    slug: 'resume-clinic-2026',
    cover: '/events/resume-clinic-2026.jpg',
    venue: 'CEG Placement Cell',
    name: 'Resume Clinic',
    date: '2026-08-27',
    endDate: '2026-08-31',
    blurb: 'Drop-in sessions where seniors and alumni review your CV line by line.',
  },
  {
    id: 'alumni-interaction-2026',
    slug: 'alumni-interaction-2026',
    cover: '/events/alumni-interaction-2026.jpg',
    venue: 'To be confirmed',
    name: 'Alumni Interaction',
    date: null,
    blurb: 'A panel of recent graduates on their first year in industry. Date being confirmed.',
  },
  {
    id: 'mock-placement-drive-2026',
    slug: 'mock-placement-drive-2026',
    cover: '/events/mock-placement-drive-2026.jpg',
    venue: 'Vivekananda Auditorium, CEG',
    name: 'Mock Placement Drive 2026',
    date: '2026-09-19',
    blurb: 'The full rehearsal — aptitude, group discussion and interview panels.',
  },
  {
    id: 'corporate-connect-2026',
    slug: 'corporate-connect-2026',
    cover: '/events/corporate-connect-2026.jpg',
    venue: 'Red Building Seminar Hall, CEG',
    name: 'Corporate Connect 2026',
    date: '2026-10-10',
    blurb: 'Recruiters and alumni on what they actually look for in a candidate.',
  },
  {
    id: 'mock-placement-drive-2025',
    slug: 'mock-placement-drive-2025',
    cover: '/events/mock-placement-drive-2025.jpg',
    venue: 'Vivekananda Auditorium, CEG',
    name: 'Mock Placement Drive 2025',
    date: '2025-09-20',
    blurb: 'Aptitude, group discussions and interview panels run across a single weekend.',
  },
  {
    id: 'corporate-connect-2025',
    slug: 'corporate-connect-2025',
    cover: '/events/corporate-connect-2025.jpg',
    venue: 'Red Building Seminar Hall, CEG',
    name: 'Corporate Connect',
    date: '2025-08-02',
    blurb: 'Recruiters and alumni on what they actually look for in a candidate.',
  },
  {
    id: 'guest-lecture-series-2025',
    slug: 'guest-lecture-series-2025',
    cover: '/events/guest-lecture-series-2025.jpg',
    venue: 'CEG Campus',
    name: 'Guest Lecture Series',
    date: '2025-04-12',
    blurb: 'Industry speakers hosted through the term.',
  },
  {
    id: 'orientation-2025',
    slug: 'orientation-2025',
    cover: '/events/orientation-2025.jpg',
    venue: 'Tag Auditorium, CEG',
    name: 'Freshers Orientation',
    date: '2025-02-08',
    blurb: 'Introducing the club and the year ahead to the incoming batch.',
  },
];

/**
 * Events newest first — the order the gallery presents.
 * Undated events sort last; they have no place on a chronological list.
 */
export const EVENTS_BY_RECENCY: ForeseEvent[] = [...EVENTS].sort((a, b) =>
  (b.date ?? '').localeCompare(a.date ?? ''),
);

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
