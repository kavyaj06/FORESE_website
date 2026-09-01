import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { SegmentedTabs } from '@/components/sections/SegmentedTabs';
import { Reveal } from '@/components/motion/Reveal';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { GALLERY_ALBUMS } from '@/pages/gallery/data';
import { BOARD_ARRANGEMENTS, PREP_BOARD, PREP_TOPICS } from '../data';
import { PrepBoardStage } from '../components/PrepBoardStage';

const PHOTOS = GALLERY_ALBUMS.flatMap((album) => album.photos);

/**
 * What to expect on the day, as a board of cards.
 *
 * This replaced three paragraphs of prose. The prose was accurate and nobody
 * read it: it asked for a minute of continuous attention before it said
 * anything a student could act on. The same five subjects as five cards ask for
 * a glance, and the one that matters to a given reader is one tap away.
 *
 * Below `desktop` the board is a different component rather than the same
 * markup rearranged by CSS. Four cards scattered around a fifth needs width
 * that a phone does not have, and hiding them with CSS would still ship every
 * photograph to a device that never displays them.
 */
export function PrepBoard() {
  const [active, setActive] = useState(PREP_TOPICS[0].id);
  const isDesktop = useMediaQuery('(min-width: 64rem)');

  const index = Math.max(
    0,
    PREP_TOPICS.findIndex((topic) => topic.id === active),
  );
  const topic = PREP_TOPICS[index];

  // Deterministic, not random: a board that rearranges differently on every
  // render cannot be tested, and looks unstable when React re-renders for an
  // unrelated reason.
  const cover = PHOTOS[(index * 5) % PHOTOS.length];
  const thumbs = Array.from({ length: 4 }, (_, i) => PHOTOS[(index * 5 + i + 1) % PHOTOS.length]);

  return (
    <section className="py-section border-border border-b">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={PREP_BOARD.eyebrow} title={PREP_BOARD.title} />
        </Reveal>
      </Container>

      <div className="mt-2xl">
        {isDesktop ? (
          <PrepBoardStage
            topic={topic}
            slots={BOARD_ARRANGEMENTS[index % BOARD_ARRANGEMENTS.length]}
            cover={cover}
            thumbs={thumbs}
          />
        ) : (
          <PrepBoardCompact topic={topic} cover={cover} thumbs={thumbs} />
        )}
      </div>

      <Container className="mt-xl flex justify-center">
        <SegmentedTabs
          tabs={PREP_TOPICS.map((t) => ({ id: t.id, label: t.label }))}
          value={active}
          onChange={setActive}
          layoutId="prep-board-tab"
          ariaLabel={PREP_BOARD.tablistLabel}
        />
      </Container>
    </section>
  );
}

/**
 * The phone's board: the same card, then the thumbnails in normal flow beneath
 * it rather than scattered around it. No absolute positioning, so there is
 * nothing that can overlap or overflow at a width nobody tested.
 */
function PrepBoardCompact({
  topic,
  cover,
  thumbs,
}: {
  topic: (typeof PREP_TOPICS)[number];
  cover?: (typeof PHOTOS)[number];
  thumbs: (typeof PHOTOS)[number][];
}) {
  return (
    <Container>
      <article className="bg-surface-raised border-border rounded-lg border p-2 shadow-md">
        <div className="bg-line-grid aspect-[4/3] w-full overflow-hidden rounded-md">
          {cover?.src && (
            <img
              src={cover.src}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          )}
        </div>
        <div className="p-sm">
          <h3 className="text-h3">{topic.title}</h3>
          <p className="text-small text-text-muted mt-xs">{topic.body}</p>
        </div>
      </article>

      <ul aria-hidden="true" className="gap-sm mt-md grid grid-cols-4">
        {thumbs.map((photo, i) => (
          <li key={i}>
            <div className="bg-line-grid aspect-[4/3] w-full overflow-hidden rounded-md">
              {photo?.src && (
                <img
                  src={photo.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              )}
            </div>
            <p className="text-caption text-text-muted mt-1 text-center">{topic.chips[i]}</p>
          </li>
        ))}
      </ul>
    </Container>
  );
}
