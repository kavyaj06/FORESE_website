import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui';

interface PhasePlaceholderProps {
  /** Which build phase will replace this, e.g. "Phase 1". */
  phase: string;
  /** What still has to arrive before the page can be built. */
  awaiting: string;
}

/**
 * ⚠️ SCAFFOLDING — delete once every page is built.
 *
 * Marks a route that exists so navigation works, but whose content is waiting
 * on a design. Deliberately plain and obviously unfinished: an invented layout
 * here would be guessed at, and guessed layouts have a way of surviving into
 * production.
 */
export function PhasePlaceholder({ phase, awaiting }: PhasePlaceholderProps) {
  return (
    <Container className="py-section">
      <Card className="border-dashed">
        <p className="text-eyebrow text-text-subtle uppercase">{phase} — not yet built</p>
        <p className="text-body text-text-muted mt-sm">{awaiting}</p>
      </Card>
    </Container>
  );
}
