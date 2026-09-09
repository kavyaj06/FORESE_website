import { HomeHero } from './sections/HomeHero';
import { StatBand } from './sections/StatBand';
import { EventJourney } from './sections/EventJourney';
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
 * `EventJourney` is two sections and one object: "Shaping futures, beyond the
 * classroom." and the event canvas below it, with a prompt bar that starts in
 * the first, walks down it, crosses the boundary and docks in the second. It
 * is one component because the bar has to leave one section and land in the
 * other, and because both have to agree about which event is current — one
 * scroll clock, one writer.
 *
 * It sits above Upcoming rather than replacing it, because the two answer
 * different questions. This is what the club runs — a standing answer, as true
 * in June as in February. Upcoming is what has not happened yet, derived from
 * the real clock at render, so it empties and refills on its own.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <StatBand />
      <EventJourney />
      <UpcomingEvents />
    </>
  );
}
