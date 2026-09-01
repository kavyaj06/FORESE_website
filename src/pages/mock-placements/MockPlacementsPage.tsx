import { PageHero } from '@/components/sections/PageHero';
import { AboutMocks } from './sections/AboutMocks';
import { PrepBoard } from './sections/PrepBoard';
import { ProcessTimeline } from './sections/ProcessTimeline';
import { PROCESS_STEPS } from './data';

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
        eyebrow="FORESE"
        title="Mock Placements"
        description="A full placement rehearsal: aptitude, group discussion and interviews with HRs from real companies, so the first time you sit in front of a recruiter is not the first time that matters."
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
