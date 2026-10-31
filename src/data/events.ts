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

import { remoteEvents } from './remote';

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
  /**
   * The headline on the event's own page. Falls back to `name`.
   *
   * A page earns a title that is not merely the event's name: FORED's own is
   * "FORED: Your Gateway to Global Education", which says what it is for
   * where the name only says what it is called.
   */
  headline?: string;
  /** The line under that headline. Falls back to `blurb`. */
  tagline?: string;
  /** The heading over the prose. Falls back to a default in the page's copy. */
  aboutTitle?: string;
  /**
   * What the event is, in prose, for its own page.
   *
   * `blurb` is the one line a row carries; this is the two or three
   * paragraphs the page opens with. A blank line starts a new paragraph —
   * the page splits on it.
   */
  about?: string;
  /** The line under "Why attend". Optional. */
  whyIntro?: string;
  /**
   * Why a student should come: **one card per line**, written
   * `Title | what it means`.
   *
   * A list of pairs stored as a string, which looks like a shortcut and is
   * not. The Firestore reader in `@/data/remote` decodes scalars only —
   * there is no `arrayValue` in its `FirestoreValue` type — so a real array
   * of objects would mean a new decoder, a repeating sub-form in the editor
   * and a migration, for four cards. Split at render it is a grid of cards
   * everywhere it is read and a textarea everywhere it is written.
   *
   * A line written without a `|` is kept as a card with no title, so someone
   * who types a plain sentence still gets something sensible.
   */
  whyAttend?: string;
  /** Who it is for — "Pre-final year, all departments". One line. */
  audience?: string;
}

/**
 * An event's `about` as paragraphs.
 *
 * A blank line starts a new one, which is what people already do in a
 * textarea without being asked. Returns an empty array when there is nothing
 * to show, so a caller can ask for the length rather than for the field.
 */
export function eventParagraphs(event: ForeseEvent): string[] {
  return (event.about ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** One "why attend" card. */
export interface EventHighlight {
  /** Absent when the line was written without a `|`. */
  title?: string;
  body: string;
}

/**
 * An event's `whyAttend` as the cards it is written as: one per line, written
 * `Title | body`.
 *
 * A leading bullet or number is stripped. Somebody writing a list in a
 * textarea types `- ` or `1. ` without being asked to, and the marker would
 * otherwise end up inside the card's own title. The contract is a convention
 * rather than a type, so it is enforced here and nowhere else.
 */
export function eventHighlights(event: ForeseEvent): EventHighlight[] {
  return (event.whyAttend ?? '')
    .split('\n')
    .map((line) =>
      line
        .trim()
        .replace(/^(?:[-•*–—]|\d+[.)])\s*/, '')
        .trim(),
    )
    .filter(Boolean)
    .map((line) => {
      const at = line.indexOf('|');
      if (at === -1) return { body: line };
      const title = line.slice(0, at).trim();
      const body = line.slice(at + 1).trim();
      return title && body ? { title, body } : { body: title || body };
    });
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

/**
 * The events the site was built with.
 *
 * Still the record of what the club ran, and still what the site renders when
 * Firestore has not answered — offline, on a failed fetch, or before a project
 * has been configured at all. Once the club has imported this list from the
 * admin page, Firestore is where it is edited; this stays as the fallback and
 * as the seed that import reads.
 */
const SEED_EVENTS: ForeseEvent[] = [
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
    // The club's own words, lifted from their previous site's FORED page at
    // forese.co.in/Event/ForeignEducationFairs. American spelling and all —
    // it is their copy, not a paraphrase of it.
    headline: 'FORED: Your Gateway to Global Education',
    tagline:
      'Connect with leading international universities and chart your path to studying abroad.',
    aboutTitle: 'Your Bridge to International Academia',
    about: [
      'FORESE’s Foreign Universities Education Fair (FORED) connects students with admission experts and education consultants who provide tailored guidance on international study options. The event enables students to explore academic programs, scholarships, and financial aid, supporting informed decisions about studying abroad. Representatives from leading universities in the US, UK, Australia, and other countries offer advice on applications, post-graduation work opportunities, and insights into academic and cultural environments.',
      'The fair also offers essential guidance on standardized tests such as the TOEFL, IELTS, and GRE, which are often required for international study. Experts explain test formats, preparation strategies, and score requirements for different institutions. This comprehensive support helps students navigate the challenges of studying abroad and prepares them for academic and personal success in a new country.',
    ].join('\n\n'),
    whyIntro:
      'Gain a comprehensive understanding of studying abroad, from applications to career prospects.',
    whyAttend: [
      'Direct University Interaction | Connect with admission experts from top universities in the US, UK, Australia, and more to get personalized insights.',
      'Scholarships & Financial Aid | Explore diverse academic specializations, scholarships, and financial aid options to make your dream a reality.',
      'Career & Visa Guidance | Receive expert advice on application processes, post-study work opportunities, and the academic landscape abroad.',
      'Standardized Test Support | Get critical guidance on TOEFL, IELTS, and GRE, including exam structures, prep strategies, and score requirements.',
    ].join('\n'),
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
    blurb: 'A run of talks on what employers expect of graduates, and how to prepare for it.',
    // ⚠️ DRAFT, as above. The one thing here that is not a guess is the
    // shape of the room: the album shows a full hall and a student on his feet
    // with a microphone, which is where the second sentence comes from.
    about: [
      'LEAP, the Learners Employability Awareness Programme, is a run of talks held over a fortnight. Each one takes a part of what employers expect from a graduate.',
      'Sessions are given to a full hall, with time at the end for students to put their own questions to the speaker.',
    ].join('\n\n'),
    whyIntro: 'What a fortnight of sessions is for, and who they are aimed at.',
    whyAttend: [
      'What employers expect | Hear it set out by the people who do the hiring, rather than second hand.',
      'Practice in public | Put your own question to a speaker in front of a full hall. It is the cheapest version of what every interview asks of you.',
      'Across a fortnight | Sessions run over two weeks, so you can come to the ones that matter to you.',
    ].join('\n'),
    audience: 'Any student heading into placements.',
  },
  {
    id: 'mock-placement-drive-2026',
    slug: 'mock-placement-drive-2026',
    cover: '/gallery/mock-placement-drive-2026/01.jpg',
    name: 'Mock Placements 2026',
    date: '2026-02-15',
    blurb: 'The full rehearsal: aptitude, group discussion and interview panels.',
    // Not drafted. The first paragraph is the club's own, carried over from
    // `MOCK_PLACEMENTS_ABOUT` on the mock placements page; the second is that
    // page's own timeline in a sentence. The two copies will drift apart the
    // first time one of them is edited, which is the trade for letting the
    // club edit this one in Firestore without touching the repository.
    about: [
      'FORESE’s Mock Placements, the flagship annual initiative of Sri Venkateswara College of Engineering, is designed to prepare pre-final year students from all disciplines for the challenges of their placement journey. Conducted in both online and offline modes, the event provides a complete simulation of the recruitment process through aptitude tests, group discussions, and personal interviews, offering students an authentic taste of real placement dynamics in a competitive yet supportive environment.',
      'The day runs in three rounds: an aptitude paper, a group discussion and a one-to-one interview with an HR. It ends with a written performance report for every student.',
    ].join('\n\n'),
    aboutTitle: 'Bridging talent with opportunity',
    whyIntro: 'The whole recruitment process, rehearsed once before it counts.',
    whyAttend: [
      'Three rounds, end to end | An aptitude paper, a group discussion, and a one-to-one interview, in a day.',
      'Real panels | The interviews are run by HRs from different companies. 130+ sat on the 2026 panels.',
      'A written report | Every student leaves with an individual performance report, compiled as a PDF.',
    ].join('\n'),
    audience: 'Pre-final year students, all disciplines.',
  },
];

/**
 * Events newest first — the order the gallery presents.
 * Undated events sort last; they have no place on a chronological list.
 */
/**
 * The live list: what the club has published, or what was built in.
 *
 * Read once, at module scope, exactly as before — `data/remote.ts` is filled
 * before this module is ever imported, so nothing downstream has to know that
 * the content now has two possible origins.
 */
export const EVENTS: ForeseEvent[] = remoteEvents() ?? SEED_EVENTS;

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
