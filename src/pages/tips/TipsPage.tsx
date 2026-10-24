import { PageHero } from '@/components/sections/PageHero';
import { TopicRail } from './components/TopicRail';
import { GroupDiscussionAct } from './sections/GroupDiscussionAct';
import { AptitudeAct } from './sections/AptitudeAct';
import { ResumeAct } from './sections/ResumeAct';
import { TipsOutro } from './sections/TipsOutro';
import { TIPS_HERO, TIPS_TOPICS } from './data';

/**
 * Interview Tips.
 *
 * Three guides the club used to keep on three separate pages — the group
 * discussion, the aptitude paper and the resume — read in the order a student
 * meets them on the mock placement day. Stays a table of contents: every word
 * is in `./data.ts`.
 */
export default function TipsPage() {
  return (
    <>
      <PageHero
        eyebrow={TIPS_HERO.eyebrow}
        title={TIPS_HERO.title}
        description={TIPS_HERO.description}
        meta={TIPS_TOPICS.map((topic) => topic.label)}
      />
      {/* The rail is sticky, and a sticky element releases at the bottom of
          its own parent — so wrapping it with the three acts is what makes it
          travel for exactly as long as there is a topic to be in, and scroll
          away with the end of the last one. */}
      <div>
        <TopicRail />
        <GroupDiscussionAct />
        <AptitudeAct />
        <ResumeAct />
      </div>

      <TipsOutro />
    </>
  );
}
