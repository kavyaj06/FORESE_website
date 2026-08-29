import { HomeHero } from './sections/HomeHero';
import { StatBand } from './sections/StatBand';
import { ConvergeSection } from './sections/ConvergeSection';
import { UpcomingEvents } from './sections/UpcomingEvents';
import { Announcements } from './sections/Announcements';

/**
 * Home.
 *
 * Follows the outline's order — hero, then Upcoming Events and Announcements —
 * with two bands added between them: the figures, and the scroll-scrubbed
 * section that says what the club is actually for. The outline's two panels
 * alone would have left the page a header and two lists.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <StatBand />
      <ConvergeSection />
      <UpcomingEvents />
      <Announcements />
    </>
  );
}
