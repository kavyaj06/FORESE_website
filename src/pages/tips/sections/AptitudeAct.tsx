import { Container } from '@/components/layout/Container';
import { PhotoBand } from '@/components/sections/PhotoBand';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { ActHeader } from '../components/ActHeader';
import { GuideStatement } from '../components/GuideStatement';
import { ObjectiveDeck } from '../components/ObjectiveDeck';
import {
  APTITUDE_FOCUS,
  APTITUDE_FOCUS_INTRO,
  APTITUDE_INTRO,
  APTITUDE_OBJECTIVES,
  guideCaption,
  guidePhoto,
  TIPS_TOPICS,
} from '../data';

const TOPIC = TIPS_TOPICS[1];

/**
 * Act two — the aptitude paper.
 *
 * Opens on the club's own prose, because that is what it is: an explanation
 * of what the test is for, which does not improve for being broken into
 * cards. Both paragraphs go to `GuideStatement` as one block, so the lit
 * edge runs through them continuously instead of restarting at the break.
 *
 * The three areas below it are set as plain columns rather than cards. They
 * are a definition of the paper, not advice to act on, and giving them the
 * same treatment as the objectives underneath would flatten the difference.
 *
 * Three surfaces, reading down: the opening and its photograph on white, what
 * the paper tests on grey, what to do about it on white again. The whole act
 * used to be one grey block, which is why the three parts of it read as one
 * undifferentiated page — the content was already in three pieces, the page
 * just never said so.
 */
export function AptitudeAct() {
  const photo = guidePhoto(TOPIC.id);

  return (
    <section id={TOPIC.id} className="scroll-mt-28">
      <div className="py-section gap-3xl flex flex-col">
        <ActHeader title={APTITUDE_INTRO.title} />
        {photo && <PhotoBand photo={photo} caption={guideCaption(TOPIC.id)} size="tall" />}
        <GuideStatement paragraphs={[APTITUDE_INTRO.lead, APTITUDE_INTRO.body]} />
      </div>

      <div className="bg-surface py-section">
        <Container>
          <SectionHeading
            as="h3"
            measure="measure"
            title={APTITUDE_FOCUS_INTRO.title}
            description={APTITUDE_FOCUS_INTRO.description}
            className="mb-xl"
          />
          <Reveal staggerChildren className="gap-xl desktop:grid-cols-3 grid grid-cols-1">
            {APTITUDE_FOCUS.map(({ icon: Icon, title, body }) => (
              <RevealItem key={title} className="border-text pt-md gap-sm flex flex-col border-t">
                <span aria-hidden="true" className="text-text">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                {/* `h4`, not the `h3` this used to be. Three areas of the
                    paper are content inside this band, not three sections
                    ranking level with "Key objectives" below. The size is
                    unchanged: `text-h3` on an `h4` is the system working as
                    intended, where the level says where a thing sits in the
                    outline and the class says how big it looks. */}
                <h4 className="text-h3">{title}</h4>
                <p className="text-small text-text-muted">{body}</p>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </div>

      {/* The objectives are dealt from a pile rather than laid out in four
          columns. They are the one group on Placement Prep that is both real
          cards and a declared sequence, which is what a deck is for. The
          heading goes inside the deck so it stays on screen while the cards
          advance; `ObjectiveDeck` carries both. */}
      <div className="py-section">
        <ObjectiveDeck copy={APTITUDE_OBJECTIVES} />
      </div>
    </section>
  );
}
