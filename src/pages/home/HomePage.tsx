import { HomeHero } from './sections/HomeHero';
import { StatBand } from './sections/StatBand';
import { ConvergeSection } from './sections/ConvergeSection';
import { ProgrammeStepper } from './sections/ProgrammeStepper';
import { UpcomingEvents } from './sections/UpcomingEvents';

/**
 * Home.
 *
 * Hero, the figures, the scroll-scrubbed section that says what the club is
 * actually for, what it runs, and then everything coming up.
 *
 * The outline's Announcements panel is gone, folded into Upcoming: its entries
 * were the dates of the mock placement rounds, which is what somebody reading
 * "Upcoming" came for. Two panels meant checking both to find out what was
 * next, with no way to tell which one a given thing would be in.
 *
 * `ProgrammeStepper` sits above Upcoming rather than replacing it, because the
 * two answer different questions. The stepper is what the club runs — a
 * standing answer, as true in June as in February. Upcoming is what has not
 * happened yet, derived from the real clock at render, so it empties and
 * refills on its own. Folding them together would mean either an event
 * disappearing from the programme the morning after it ran, or a "what is
 * next" list with last term's events in it.
 *
 * ⚠️ Two pinned sections in a row. `ConvergeSection` holds its own travel and
 * the stepper follows immediately with three screens more, so there is a long
 * stretch here where the wheel moves the stage rather than the document. The
 * stepper's runway is deliberately the shorter of the two; if the pair still
 * reads as too long, `STEP_VH` in `ProgrammeStepper` is the dial.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <StatBand />
      <ConvergeSection />
      <ProgrammeStepper />
      <UpcomingEvents />
    </>
  );
}
