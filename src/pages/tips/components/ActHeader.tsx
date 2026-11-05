import { Container } from '@/components/layout/Container';
import { Reveal, RevealItem } from '@/components/motion/Reveal';

interface ActHeaderProps {
  title: string;
}

/**
 * The opening of one of the three guides: the headline, and nothing else.
 *
 * It used to carry a rule with a number and a kicker over it, back when the
 * three guides were three acts of one scrolling page and a reader needed to
 * know which of them they had reached. They are separate pages now, each with
 * the rail above it saying which one is open, so the row was answering a
 * question nobody was still asking. The club asked for it gone.
 *
 * It also used to carry the lead paragraph, and a photograph beside it. Both
 * have moved below: the photograph to a full-bleed band, the lead to
 * `GuideStatement`, where it is lit word by word as the reader scrolls into
 * it. A statement cannot be read that way while it is already on screen at
 * page load, which is what it was up here.
 *
 * What is left is a headline on white under a black hero — which is what an
 * article opening looks like, and is the right amount of furniture above a
 * full-width photograph.
 */
export function ActHeader({ title }: ActHeaderProps) {
  return (
    <Container>
      <Reveal staggerChildren>
        <RevealItem as="h2" className="text-h2 max-w-[20ch] text-balance">
          {title}
        </RevealItem>
      </Reveal>
    </Container>
  );
}
