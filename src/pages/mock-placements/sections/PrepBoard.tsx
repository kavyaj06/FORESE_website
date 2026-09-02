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
  thumbnails: [0, 1, 2, 3].map((i) => ({
    tag: topic.chips[i],
    flipText: topic.chipFlips[i],
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
 *
 * Shorter padding than `py-section` on both edges, because the sections either
 * side already end with 48px of their own. Two full section paddings met at
 * each seam: 190px of empty page above this heading, and as much again between
 * the tab strip and "How it works" below.
 */
export function PrepBoard() {
  return (
    <section className="pt-2xl pb-2xl border-border border-b">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={PREP_BOARD.eyebrow} title={PREP_BOARD.title} />
        </Reveal>
      </Container>

      {/* Tighter on a phone: the board is pinned and centres its card in a
          full-height viewport, so this margin is added to whatever the
          centring already leaves. Together they put 142px of empty page under
          the heading. */}
      <div className="mt-md tablet:mt-2xl">
        <CaseStudyStack slides={SLIDES} tablistLabel={PREP_BOARD.tablistLabel} />
      </div>
    </section>
  );
}
