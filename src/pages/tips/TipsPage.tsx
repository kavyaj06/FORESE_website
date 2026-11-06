import { Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { PageHero } from '@/components/sections/PageHero';
import { TopicRail } from './components/TopicRail';
import { GroupDiscussionAct } from './sections/GroupDiscussionAct';
import { AptitudeAct } from './sections/AptitudeAct';
import { ResumeAct } from './sections/ResumeAct';
import { FIRST_TOPIC, findTopic, TIPS_HERO } from './data';

/**
 * What each guide is made of. Keyed by the topic's `id`, so the route, the
 * rail, the heading's number and the content all come from one list.
 */
const GUIDES: Record<string, () => React.ReactElement> = {
  'group-discussion': GroupDiscussionAct,
  aptitude: AptitudeAct,
  resume: ResumeAct,
};

/**
 * Placement Prep — one guide at a time.
 *
 * Three guides the club used to keep on three separate pages: the group
 * discussion, the aptitude paper and the resume. They were briefly one page
 * with all three stacked on it, which came to 6,700px — a student sent here
 * for resume advice scrolled through the whole group discussion to reach it.
 * So they are pages again, at `/tips/<topic>`, and the rail under the hero
 * switches between them.
 *
 * The hero does not change between them on purpose. It is the same place with
 * three rooms in it, and a reader who clicks Aptitude should feel they have
 * opened a drawer rather than left for somewhere else.
 *
 * An unknown topic — a typo, or a link to a guide that has been renamed —
 * lands on the first guide rather than on the 404 page. There is no state to
 * lose and the rail is right there, which is a better answer than a dead end.
 */
export default function TipsPage() {
  const { topic: requested } = useParams();
  const prefersReducedMotion = usePrefersReducedMotion();
  const topic = findTopic(requested);

  if (!topic) return <Navigate to={`/tips/${FIRST_TOPIC.id}`} replace />;

  const Guide = GUIDES[topic.id];

  return (
    <>
      <PageHero
        eyebrow={TIPS_HERO.eyebrow}
        title={TIPS_HERO.title}
        description={TIPS_HERO.description}
        // The description is the first prose on the page and it ran to 85
        // characters a line at desktop width. `measure` brings it to about 64,
        // which is inside the band a line of text is comfortably read at.
        measure="measure"
      />
      <TopicRail />

      {/* Only the guide changes between topics, so only the guide moves. The
          hero and the rail above it stay mounted — see the note on the
          transition's key in `RootLayout` — and the key here is what makes
          this one subtree arrive rather than simply swap. */}
      <motion.div
        key={topic.id}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: EASE_OUT_BRAND }}
      >
        <Guide />
      </motion.div>
    </>
  );
}
