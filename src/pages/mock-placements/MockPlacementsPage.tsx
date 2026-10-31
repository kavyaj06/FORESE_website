import { PageHero } from '@/components/sections/PageHero';
import { AboutMocks } from './sections/AboutMocks';
import { PrepBoard } from './sections/PrepBoard';
import { ProcessTimeline } from './sections/ProcessTimeline';
import { MOCK_PLACEMENTS_HERO, PROCESS_STEPS } from './data';

/**
 * Mock Placements.
 *
 * Stays a readable table of contents: it composes sections, and every word on
 * the page comes from `./data.ts`.
 */
export default function MockPlacementsPage() {
  return (
    <>
      <PageHero
        eyebrow={MOCK_PLACEMENTS_HERO.eyebrow}
        title={MOCK_PLACEMENTS_HERO.title}
        description={MOCK_PLACEMENTS_HERO.description}
        meta={[
          `${PROCESS_STEPS.length} stages`,
          'Run every academic year',
          'For all pre-final years',
        ]}
      />
      <AboutMocks />
      <PrepBoard />
      <ProcessTimeline />
    </>
  );
}
