import { HomeHero } from './sections/HomeHero';
import { StatBand } from './sections/StatBand';
import { ConvergeSection } from './sections/ConvergeSection';
import { UpcomingEvents } from './sections/UpcomingEvents';

/**
 * Home.
 *
 * Hero, the figures, the scroll-scrubbed section that says what the club is
 * actually for and what it runs, and then everything coming up.
 *
 * The outline's Announcements panel is gone, folded into Upcoming: its entries
 * were the dates of the mock placement rounds, which is what somebody reading
 * "Upcoming" came for. Two panels meant checking both to find out what was
 * next, with no way to tell which one a given thing would be in.
 *
 * Two sections that stood here — a 3D image tunnel and a second node canvas —
 * have been removed at the club's request. Both told the same story as
 * `ConvergeSection` now tells in one pass: the canvas in particular drew the
 * same three events as connected nodes, so the page pinned itself twice to say
 * one thing. One pinned stretch is the whole of it now.
 *
 * `ConvergeSection` sits above Upcoming rather than replacing it, because the
 * two answer different questions. It is what the club runs — a standing answer,
 * as true in June as in February. Upcoming is what has not happened yet,
 * derived from the real clock at render, so it empties and refills on its own.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <StatBand />
      <ConvergeSection />
      <UpcomingEvents />
    </>
  );
}
