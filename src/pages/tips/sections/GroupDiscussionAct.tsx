import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { circulatingPhotos } from '@/pages/gallery/data';
import { ActHeader } from '../components/ActHeader';
import { PhaseRail } from '../components/PhaseRail';
import { StrategyColumns } from '../components/StrategyColumns';
import { TipCard } from '../components/TipCard';
import {
  GROUP_DISCUSSION_BENEFITS,
  GROUP_DISCUSSION_INTRO,
  GROUP_DISCUSSION_MISTAKES,
  GROUP_DISCUSSION_PHOTO_ID,
  GROUP_DISCUSSION_PLAYBOOK,
  GROUP_DISCUSSION_STRATEGIES,
  TIPS_TOPICS,
} from '../data';

/**
 * The club's own picture of a discussion round, if it is still in the gallery
 * and still allowed to travel. `undefined` is a normal outcome, not a bug: the
 * opener then runs as a single column of text.
 */
const PHOTO = circulatingPhotos().find((photo) => photo.id === GROUP_DISCUSSION_PHOTO_ID);

/**
 * Act one — the group discussion.
 *
 * Four blocks in the order a student needs them: what the round is worth,
 * how it unfolds minute by minute, what to do in it, and what not to. The
 * last of those is the only one on a black band, because it is the only one
 * that is a warning.
 */
export function GroupDiscussionAct() {
  return (
    <section id={TIPS_TOPICS[0].id}>
      <div className="py-section gap-3xl flex flex-col">
        <ActHeader
          index={0}
          eyebrow={GROUP_DISCUSSION_INTRO.eyebrow}
          title={GROUP_DISCUSSION_INTRO.title}
          lead={GROUP_DISCUSSION_INTRO.lead}
          media={
            PHOTO?.src && (
              <figure className="relative overflow-hidden rounded-lg">
                <img
                  src={PHOTO.src}
                  alt={PHOTO.alt}
                  width={PHOTO.width}
                  height={PHOTO.height}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
                />
                <figcaption className="text-small p-lg absolute inset-x-0 bottom-0 text-white">
                  {GROUP_DISCUSSION_INTRO.caption}
                </figcaption>
              </figure>
            )
          }
        />

        <Container>
          <SectionHeading
            as="h3"
            title={GROUP_DISCUSSION_BENEFITS.title}
            description={GROUP_DISCUSSION_BENEFITS.description}
            className="mb-xl"
          />
          <Reveal staggerChildren className="gap-lg tablet:grid-cols-2 desktop:grid-cols-3 grid">
            {GROUP_DISCUSSION_BENEFITS.items.map((item) => (
              <RevealItem key={item.title} className="h-full">
                <TipCard item={item} />
              </RevealItem>
            ))}
          </Reveal>
        </Container>

        <Container>
          <SectionHeading
            as="h3"
            title={GROUP_DISCUSSION_PLAYBOOK.title}
            description={GROUP_DISCUSSION_PLAYBOOK.description}
            className="mb-xl"
          />
          <PhaseRail phases={GROUP_DISCUSSION_PLAYBOOK.phases} />
        </Container>

        <Container>
          <SectionHeading
            as="h3"
            title={GROUP_DISCUSSION_STRATEGIES.title}
            description={GROUP_DISCUSSION_STRATEGIES.description}
            className="mb-xl"
          />
          <StrategyColumns columns={GROUP_DISCUSSION_STRATEGIES.columns} />
        </Container>
      </div>

      {/* The one warning on the page, and the only block given a band of its
          own. In a palette with no red in it, black is what emphasis is made
          of — see the note on `[data-theme='inverse']` in theme.css. */}
      <div data-theme="inverse" className="bg-bg py-section">
        <Container>
          <SectionHeading
            as="h3"
            title={GROUP_DISCUSSION_MISTAKES.title}
            description={GROUP_DISCUSSION_MISTAKES.description}
            className="mb-xl"
          />
          <Reveal
            staggerChildren
            as="ul"
            className="gap-md tablet:grid-cols-2 desktop:grid-cols-3 grid"
          >
            {GROUP_DISCUSSION_MISTAKES.items.map(({ icon: Icon, label }) => (
              <RevealItem
                key={label}
                as="li"
                className="border-border bg-surface-raised gap-md px-lg flex items-center rounded-lg border py-4"
              >
                <span
                  aria-hidden="true"
                  className="border-border text-text-muted rounded-pill flex size-9 shrink-0 items-center justify-center border"
                >
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <span className="text-small">{label}</span>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
