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
 * The stepper does not pin. `ConvergeSection` above it does, and two pinned
 * sections in a row would be a long stretch where the wheel moves a stage
 * rather than the document. The stepper sticks its layers instead and lets the
 * words scroll through them, so the page keeps moving the whole way down.
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
