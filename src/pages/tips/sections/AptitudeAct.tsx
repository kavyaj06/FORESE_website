import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { ActHeader } from '../components/ActHeader';
import { TipCard } from '../components/TipCard';
import { APTITUDE_FOCUS, APTITUDE_INTRO, APTITUDE_OBJECTIVES, TIPS_TOPICS } from '../data';

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
 */
export function AptitudeAct() {
  return (
    <section id={TIPS_TOPICS[1].id} className="bg-surface">
      <div className="py-section gap-3xl flex flex-col">
        <ActHeader
          index={1}
          eyebrow={APTITUDE_INTRO.eyebrow}
          title={APTITUDE_INTRO.title}
          lead={APTITUDE_INTRO.lead}
        >
          <p className="text-body text-text-muted">{APTITUDE_INTRO.body}</p>
        </ActHeader>

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
