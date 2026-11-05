import { Container } from '@/components/layout/Container';
import { PhotoBand } from '@/components/sections/PhotoBand';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';
import { ActHeader } from '../components/ActHeader';
import { TipCard } from '../components/TipCard';
import {
  APTITUDE_FOCUS,
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
 * Opens as two columns of the club's own prose, because that is what it is:
 * an explanation of what the test is for, which does not improve for being
 * broken into cards.
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
    <section id={TOPIC.id}>
      <div className={cn('pt-section gap-3xl flex flex-col', !photo && 'pb-section')}>
        <ActHeader title={APTITUDE_INTRO.title} lead={APTITUDE_INTRO.lead}>
          <p className="text-body text-text-muted">{APTITUDE_INTRO.body}</p>
        </ActHeader>

        {photo && <PhotoBand photo={photo} caption={guideCaption(TOPIC.id)} size="tall" />}
      </div>

      <div className="bg-surface py-section">
        <Container>
          <Reveal staggerChildren className="gap-xl desktop:grid-cols-3 grid grid-cols-1">
            {APTITUDE_FOCUS.map(({ icon: Icon, title, body }) => (
              <RevealItem key={title} className="border-text pt-md gap-sm flex flex-col border-t">
                <span aria-hidden="true" className="text-text">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="text-h3">{title}</h3>
                <p className="text-small text-text-muted">{body}</p>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </div>

      <div className="py-section">
        <Container>
          <SectionHeading
            as="h3"
            title={APTITUDE_OBJECTIVES.title}
            description={APTITUDE_OBJECTIVES.description}
            className="mb-xl"
          />
          <Reveal staggerChildren className="gap-lg tablet:grid-cols-2 desktop:grid-cols-4 grid">
            {APTITUDE_OBJECTIVES.items.map((item, index) => (
              <RevealItem key={item.title} className="h-full">
                <TipCard item={item} index={index} />
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
