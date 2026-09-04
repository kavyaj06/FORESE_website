/**
 * The club's events — site-level, not page-level.
 *
 * This is the one deliberate exception to "content lives in the page's own
 * data.ts". The same events are named by the Gallery (which groups photographs
 * under them), the Events page, and the Home page's upcoming panel. Three
 * copies of the same list would drift apart within a term.
 *
 * Both events below are the club's own, with real dates and real photographs.
 * The invented stand-ins that used to fill this list are gone.
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

/**
 * Every event split by status, each group newest first.
 *
 * One rule for all three, at the club's request: whichever tab a reader opens,
 * the most recent event is at the top. Upcoming used to run the other way —
 * soonest first, which is the more usual reading of a schedule — and the cost
 * of the change is that the nearest upcoming event is now at the bottom of its
 * own tab. That is the trade the club asked for, and consistency across the
 * tabs is what they wanted from it.
 *
 * Undated events sort last everywhere: `date ?? ''` is smaller than any real
 * date, so a descending sort puts them at the end without a special case.
 */
export function groupEventsByStatus(now: Date = new Date()): Record<EventStatus, ForeseEvent[]> {
  const groups: Record<EventStatus, ForeseEvent[]> = {
    ongoing: [],
    upcoming: [],
    completed: [],
  };

  for (const event of EVENTS) {
    groups[eventStatus(event, now)].push(event);
  }

  const newestFirst = (a: ForeseEvent, b: ForeseEvent) =>
    (b.date ?? '').localeCompare(a.date ?? '');
  groups.ongoing.sort(newestFirst);
  groups.upcoming.sort(newestFirst);
  groups.completed.sort(newestFirst);

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
  // UTC getters, for the same reason `formatEventDate` formats in UTC.
  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth();

  // "19–21 September 2026" rather than repeating the month and year twice.
  if (sameMonth) {
    return `${start.getUTCDate()}\u2013${formatEventDate(event.endDate)}`;
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
  {
    id: 'fored-2026',
    slug: 'fored-2026',
    // Covers point at one of the event's own gallery photographs rather than a
    // separate file under `/events/`, so there is only ever one copy of a
    // picture to keep.
    cover: '/gallery/fored-2026/02.jpg',
    name: 'FORED (Foreign Universities Education Fair)',
    date: '2026-08-07',
    blurb:
      'Representatives from overseas universities met students for one-to-one sessions on studying abroad.',
  },
  {
    id: 'leap-2026',
    slug: 'leap-2026',
    cover: '/gallery/leap-2026/04.jpg',
    name: 'LEAP (The Learners Employability Awareness Programme)',
    // Four session dates are burned into the photographs by the camera app:
    // 28, 30 and 31 July and 7 August 2026, each with a weekday that checks
    // out against the calendar. The club remembered it as "August"; the run
    // actually opens in late July, which is why this carries a range.
    date: '2026-07-28',
    endDate: '2026-08-07',
    blurb:
      'A run of talks on employability — what employers expect of graduates, and how to prepare for it.',
  },
  {
    id: 'mock-placement-drive-2026',
    slug: 'mock-placement-drive-2026',
    cover: '/gallery/mock-placement-drive-2026/01.jpg',
    name: 'Mock Placements 2026',
    date: '2026-02-15',
    blurb: 'The full rehearsal: aptitude, group discussion and interview panels.',
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
    // A bare `YYYY-MM-DD` parses as UTC midnight, so formatting it in the
    // reader's own zone shows the day before for anyone west of Greenwich.
    // An event's date is a calendar fact, not an instant, so it is read back
    // in the zone it was written in.
    timeZone: 'UTC',
  }).format(new Date(iso));
}
