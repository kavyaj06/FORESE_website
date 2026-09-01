import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { GALLERY_ALBUMS } from '@/pages/gallery/data';
import { PREP_BOARD, PREP_TOPICS } from '../data';
import { CaseStudyStack, type StackSlide } from '../components/CaseStudyStack';

const PHOTOS = GALLERY_ALBUMS.flatMap((album) => album.photos);

/**
 * The five topics as a deck of cards.
 *
 * Built once at module scope rather than in the component: the stack owns the
 * order of these as state, and handing it a new array identity on every render
 * would reset that order out from under the reader.
 *
 * Pictures are assigned deterministically, five to a topic. Random assignment
 * looks livelier and cannot be tested, and re-rolls itself whenever React
 * re-renders for an unrelated reason.
 */
const SLIDES: StackSlide[] = PREP_TOPICS.map((topic, index) => ({
  id: topic.id,
  category: topic.label,
  image: PHOTOS[(index * 5) % PHOTOS.length]?.src,
  description: topic.body,
  flipText: topic.flipText,
  thumbnails: [0, 1, 2, 3].map((i) => ({
    tag: topic.chips[i],
    image: PHOTOS[(index * 5 + i + 1) % PHOTOS.length]?.src,
  })) as StackSlide['thumbnails'],
}));

/**
 * What to expect on the day.
 *
 * This replaced three paragraphs of prose. The prose was accurate and unread:
 * it asked for a minute of continuous attention before saying anything a
 * student could act on. A deck asks for a glance, and the card that matters to
 * a given reader is one click away.
 */
export function PrepBoard() {
  return (
    <section className="py-section border-border border-b">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={PREP_BOARD.eyebrow} title={PREP_BOARD.title} />
        </Reveal>
      </Container>

      <div className="mt-2xl">
        <CaseStudyStack slides={SLIDES} tablistLabel={PREP_BOARD.tablistLabel} />
      </div>
    </section>
  );
}
