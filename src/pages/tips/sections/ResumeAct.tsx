import { Container } from '@/components/layout/Container';
import { PhotoBand } from '@/components/sections/PhotoBand';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { ActHeader } from '../components/ActHeader';
import { GuideStatement } from '../components/GuideStatement';
import { TipCard } from '../components/TipCard';
import { guideCaption, guidePhoto, RESUME_INTRO, RESUME_TIPS, TIPS_TOPICS } from '../data';

const TOPIC = TIPS_TOPICS[2];

/**
 * Act three — the resume.
 *
 * Six pieces of advice, unnumbered: they are a set to apply all of, not a
 * sequence to work through, and numbering them would say otherwise.
 *
 * Two surfaces, not one. This guide used to be a black hero over a single
 * sheet of white that ran to the footer, which is the shape the club's
 * reviewers called bland. The headline, the photograph and the statement
 * hold the white; the six cards sit on grey below it.
 */
export function ResumeAct() {
  const photo = guidePhoto(TOPIC.id);

  return (
    <section id={TOPIC.id} className="scroll-mt-28">
      <div className="py-section gap-3xl flex flex-col">
        <ActHeader title={RESUME_INTRO.title} />
        {photo && <PhotoBand photo={photo} caption={guideCaption(TOPIC.id)} size="tall" />}
        <GuideStatement paragraphs={[RESUME_INTRO.lead]} />
      </div>

      <div className="bg-surface py-section">
        <Container>
          <SectionHeading
            as="h3"
            measure="measure"
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
