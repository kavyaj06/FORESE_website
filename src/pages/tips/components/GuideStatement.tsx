import { Container } from '@/components/layout/Container';
import { ScrollLitText } from '@/components/motion/ScrollLitText';

interface GuideStatementProps {
  /** One entry per paragraph. Plain text — word-level animation owns the string. */
  paragraphs: string[];
}

/**
 * The claim a guide makes, set large and lit by the reader's own scrolling.
 *
 * This is Placement Prep's one signature moment, and it is here rather than
 * in the header for a reason that is about scroll distance, not taste. The
 * lighting is tied to how far the block has travelled through the viewport,
 * so a block that is already on screen when the page loads has spent most of
 * its range before the reader has done anything. Below the photograph the
 * statement starts off-screen on every viewport, and the sweep runs exactly
 * as the reader arrives at it.
 *
 * Set narrow on purpose. A line of 60-odd characters is one eye movement,
 * and the lit edge travelling along it is legible; across a 1200px column it
 * becomes a bar sweeping the screen.
 */
export function GuideStatement({ paragraphs }: GuideStatementProps) {
  return (
    <Container>
      <ScrollLitText
        paragraphs={paragraphs}
        className="text-h3 max-w-content-narrow mx-auto text-balance"
      />
    </Container>
  );
}
