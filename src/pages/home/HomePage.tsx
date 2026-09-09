import { HomeHero } from './sections/HomeHero';
import { StatBand } from './sections/StatBand';
import { ConvergeSection } from './sections/ConvergeSection';
import { StoryCarousel } from './sections/StoryCarousel';
import { WorkflowCanvas } from './sections/WorkflowCanvas';
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
 * `StoryCarousel` and `WorkflowCanvas` replaced the programme stepper that
 * stood here — the club asked for the reference's scroll storytelling in its
 * place. The carousel runs the gallery along a curved track as you scroll; the
 * canvas draws the year's three events as connected nodes. Both are scrubbed
 * by scroll position, neither loops on its own.
 *
 * They sit above Upcoming rather than replacing it, because the two answer
 * different questions. These are what the club runs — a standing answer, as
 * true in June as in February. Upcoming is what has not happened yet, derived
 * from the real clock at render, so it empties and refills on its own.
 *
 * ⚠️ Three pinned stretches now run back to back: `ConvergeSection`, then the
 * carousel, then the canvas. That is a long way down the page where the wheel
 * moves a stage rather than the document. `RUNWAY_VH` at the top of each of
 * the two new sections is the dial if it reads as too much.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <StatBand />
      <ConvergeSection />
      <StoryCarousel />
      <WorkflowCanvas />
      <UpcomingEvents />
    </>
  );
}
