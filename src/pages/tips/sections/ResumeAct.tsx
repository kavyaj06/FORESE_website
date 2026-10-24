import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { ActHeader } from '../components/ActHeader';
import { TipCard } from '../components/TipCard';
import { RESUME_INTRO, RESUME_TIPS, TIPS_TOPICS } from '../data';

/**
 * Act three — the resume.
 *
 * Six pieces of advice, unnumbered: they are a set to apply all of, not a
 * sequence to work through, and numbering them would say otherwise.
 */
export function ResumeAct() {
  return (
    <section id={TIPS_TOPICS[2].id}>
      <div className="py-section gap-3xl flex flex-col">
        <ActHeader
          index={2}
          eyebrow={RESUME_INTRO.eyebrow}
          title={RESUME_INTRO.title}
          lead={RESUME_INTRO.lead}
        />

        <Container>
          <SectionHeading
            as="h3"
            title={RESUME_TIPS.title}
            description={RESUME_TIPS.description}
            className="mb-xl"
          />
          <Reveal staggerChildren className="gap-lg tablet:grid-cols-2 desktop:grid-cols-3 grid">
            {RESUME_TIPS.items.map((item) => (
              <RevealItem key={item.title} className="h-full">
                <TipCard item={item} />
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
