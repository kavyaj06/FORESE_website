import { PageHero } from '@/components/sections/PageHero';
import { ProcessTimeline } from './sections/ProcessTimeline';
import { DriveCallout } from './sections/DriveCallout';

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
        title="Mock Placement"
        description="A full placement rehearsal — aptitude, group discussion and interviews with HRs from real companies, so the first time you sit in front of a recruiter is not the first time that matters."
      />
      <ProcessTimeline />
      <DriveCallout />
    </>
  );
}
