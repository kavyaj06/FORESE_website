import { Container } from '@/components/layout/Container';
import { PhotoBand } from '@/components/sections/PhotoBand';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { ActHeader } from '../components/ActHeader';
import { GuideStatement } from '../components/GuideStatement';
import { PhaseRail } from '../components/PhaseRail';
import { StrategyColumns } from '../components/StrategyColumns';
import { TipCard } from '../components/TipCard';
import {
  GROUP_DISCUSSION_BENEFITS,
  GROUP_DISCUSSION_INTRO,
  GROUP_DISCUSSION_MISTAKES,
  GROUP_DISCUSSION_PLAYBOOK,
  GROUP_DISCUSSION_STRATEGIES,
  guideCaption,
  guidePhoto,
  TIPS_TOPICS,
} from '../data';

const TOPIC = TIPS_TOPICS[0];

/**
 * Act one — the group discussion.
 *
 * Four blocks in the order a student needs them: what the round is worth,
 * how it unfolds minute by minute, what to do in it, and what not to.
 *
 * **The photograph is full-bleed under the opening rather than beside it.**
 * It used to take the second column of the header, which is a perfectly good
 * figure — but the other two guides had no picture at all, and once they were
 * given one, an inline figure here against a full-width band there would have
 * made the three guides open three different ways. They are one feature with
 * a rail switching between them; they should arrive the same.
 *
 * Four surfaces, alternating: the opening and the picture on white, the
 * benefits on grey, the playbook and the strategies on white, the mistakes on
 * grey. The mistakes keep a band of their own because they are the one
 * warning on the page, and it stays grey rather than black — a black section
 * mid-guide read as the end of the guide, and a reader who stopped there
 * missed the two the rail was offering.
 */
export function GroupDiscussionAct() {
  const photo = guidePhoto(TOPIC.id);

  return (
    <section id={TOPIC.id} className="scroll-mt-28">
      <div className="py-section gap-3xl flex flex-col">
        <ActHeader title={GROUP_DISCUSSION_INTRO.title} />
        {photo && <PhotoBand photo={photo} caption={guideCaption(TOPIC.id)} size="tall" />}
        <GuideStatement paragraphs={[GROUP_DISCUSSION_INTRO.lead]} />
      </div>

      <div className="bg-surface py-section">
        <Container>
          <SectionHeading
            as="h3"
            measure="measure"
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
      </div>

      <div className="py-section gap-3xl flex flex-col">
        <Container>
          <SectionHeading
            as="h3"
            measure="measure"
            title={GROUP_DISCUSSION_PLAYBOOK.title}
            description={GROUP_DISCUSSION_PLAYBOOK.description}
            className="mb-xl"
          />
          <PhaseRail phases={GROUP_DISCUSSION_PLAYBOOK.phases} />
        </Container>

        <Container>
          <SectionHeading
            as="h3"
            measure="measure"
            title={GROUP_DISCUSSION_STRATEGIES.title}
            description={GROUP_DISCUSSION_STRATEGIES.description}
            className="mb-xl"
          />
          <StrategyColumns columns={GROUP_DISCUSSION_STRATEGIES.columns} />
        </Container>
      </div>

      <div className="bg-surface py-section">
        <Container>
          <SectionHeading
            as="h3"
            measure="measure"
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
