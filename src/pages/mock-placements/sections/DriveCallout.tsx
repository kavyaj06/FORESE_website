import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { Button } from '@/components/ui';
import { MOCK_PLACEMENTS_CALLOUT } from '../data';

/**
 * Closing band.
 *
 * Runs on `data-theme="inverse"`, which flips the tokens to their dark values
 * for everything inside. Nothing in here needs a dark variant — `Button`,
 * `text-text-muted` and the dot field all resolve against the inverted tokens
 * on their own.
 *
 * It earns its place structurally as well as visually: the page is otherwise
 * one long light column, and ending on a black band gives it a floor.
 */
export function DriveCallout() {
  const { title, description, actions } = MOCK_PLACEMENTS_CALLOUT;

  return (
    <section data-theme="inverse" className="py-section relative isolate overflow-hidden">
      <div aria-hidden="true" className="bg-dot-grid mask-radial-fade absolute inset-0 -z-10" />

      <Container width="narrow">
        <Reveal staggerChildren className="gap-lg flex flex-col items-center text-center">
          <RevealItem as="h2" className="text-h2 text-balance">
            {title}
          </RevealItem>

          <RevealItem as="p" className="text-body-lg text-text-muted">
            {description}
          </RevealItem>

          <RevealItem className="gap-sm pt-xs flex flex-wrap justify-center">
            <Button
              to={actions.primary.to}
              iconRight={<ArrowRight size={16} strokeWidth={2} aria-hidden="true" />}
            >
              {actions.primary.label}
            </Button>
            <Button to={actions.secondary.to} variant="secondary">
              {actions.secondary.label}
            </Button>
          </RevealItem>
        </Reveal>
      </Container>
    </section>
  );
}
