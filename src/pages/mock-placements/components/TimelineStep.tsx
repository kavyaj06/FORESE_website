import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import type { ProcessStep } from '../data';

interface TimelineStepProps {
  step: ProcessStep;
  /** 1-based position, rendered as the card's eyebrow. */
  index: number;
}

/**
 * One stage on the mock placement rail: a node on the spine, and the card
 * beside it.
 *
 * Purely presentational — the entrance animation is applied by the parent
 * section, which is what lets each step reveal as it scrolls into view rather
 * than all six firing at once when the list first appears.
 *
 * The node is opaque on purpose. The spine runs behind the whole column, and
 * the node covering it is what makes the line appear to run *between* stages
 * rather than straight through them.
 */
export function TimelineStep({ step, index }: TimelineStepProps) {
  const { title, description, icon: Icon, timing, action } = step;

  return (
    <div className="gap-md tablet:gap-lg flex items-start">
      {/* Node */}
      <div
        aria-hidden="true"
        className="bg-surface border-border text-text tablet:size-12 relative flex size-10 shrink-0 items-center justify-center rounded-lg border"
      >
        <Icon size={20} strokeWidth={1.75} />
      </div>

      {/* Content */}
      <div className="gap-sm flex min-w-0 flex-1 flex-col">
        {timing && (
          <p className="text-small text-text-muted gap-xs flex items-center">
            <CalendarDays size={15} strokeWidth={1.75} aria-hidden="true" />
            {timing}
          </p>
        )}

        <Card padding="lg">
          <p className="text-eyebrow text-text-subtle uppercase">
            Step {String(index).padStart(2, '0')}
          </p>

          <h3 className="text-h3 mt-xs">{title}</h3>

          <p className="text-body text-text-muted mt-sm">{description}</p>

          {action && (
            <div className="mt-lg">
              <Button
                href={action.href}
                variant="secondary"
                size="sm"
                iconRight={<ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />}
              >
                {action.label}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
