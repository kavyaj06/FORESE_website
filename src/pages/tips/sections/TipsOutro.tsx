import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button, Card } from '@/components/ui';
import { Reveal } from '@/components/motion/Reveal';
import { TIPS_OUTRO } from '../data';

/**
 * Where the guide sends you next.
 *
 * Light rather than another black band: the footer below it is already
 * inverse, and two dark bands running into each other read as one long one.
 */
export function TipsOutro() {
  return (
    <section className="bg-surface py-section">
      <Container>
        <Reveal>
          <Card
            padding="lg"
            className="gap-lg desktop:flex-row desktop:items-center desktop:justify-between flex flex-col"
          >
            <div className="gap-sm flex flex-col">
              <h2 className="text-h3">{TIPS_OUTRO.title}</h2>
              <p className="text-small text-text-muted max-w-[52ch]">{TIPS_OUTRO.description}</p>
            </div>

            <div className="gap-sm flex shrink-0 flex-wrap">
              <Button
                to={TIPS_OUTRO.action.to}
                iconRight={<ArrowRight size={16} strokeWidth={2} aria-hidden="true" />}
              >
                {TIPS_OUTRO.action.label}
              </Button>
              <Button to={TIPS_OUTRO.secondary.to} variant="secondary">
                {TIPS_OUTRO.secondary.label}
              </Button>
            </div>
          </Card>
        </Reveal>
      </Container>
    </section>
  );
}
