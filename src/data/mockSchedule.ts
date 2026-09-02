/**
 * Dated stages of the mock placement process — site-level, like the events.
 *
 * Separate from `PROCESS_STEPS` on the Mock Placements page, and it has to be.
 * Those six describe what each stage *is*, and they are true every year; these
 * are the dates one particular run of it falls on. Putting a date on a
 * description would mean rewriting the description every year to change a
 * number, and the page that explains the process would go stale the day the
 * process ran.
 *
 * ⚠️ DUMMY dates. These carry over from the announcements the home page used
 * to list, which is where the club's real dates will go. Replace them with the
 * announced schedule — a date on a home page is a promise about when to turn
 * up.
 *
 * Status is derived at render from the real clock, exactly as `events.ts` does
 * it, so a stage drops off the home page on its own the morning after it runs.
 * Nothing here is ever hand-sorted or hand-expired.
 *
 * **Nothing here may also be an event.** The mock placement day itself is in
 * `events.ts`, and listing it here as well put it on the home page twice, on
 * the same date, under two different labels. This list is for the dates around
 * that day which are not events in their own right — a portal opening, a
 * sign-up window closing, results going out. If a stage deserves a page in the
 * gallery and a card on the events page, it is an event; put it there.
 */

export interface MockStage {
  id: string;
  /** What is happening. Shown as the card's title. */
  name: string;
  /** ISO 8601. Unlike an event, an undated stage is not announced at all. */
  date: string;
  /** ISO end date for a stage that runs over several days. */
  endDate?: string;
  blurb?: string;
}

export const MOCK_SCHEDULE: MockStage[] = [
  {
    id: 'resume-clinic-close',
    name: 'Resume Clinic sign-ups close',
    date: '2026-08-29',
    blurb: 'Last day to take a one-on-one CV review slot before the mock placements.',
  },
  {
    id: 'aptitude-window',
    name: 'Aptitude round opens',
    date: '2026-09-05',
    blurb:
      'Every pre-final year student writes the aptitude round on the college portal. Scores carry forward into panel allocation.',
  },
];

/** The stages still ahead, soonest first. */
export function upcomingStages(now: Date = new Date()): MockStage[] {
  const today = now.toISOString().slice(0, 10);
  return MOCK_SCHEDULE.filter((stage) => today <= (stage.endDate ?? stage.date)).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}
