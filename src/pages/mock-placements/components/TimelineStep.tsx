import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ProcessStep } from '../data';

interface TimelineStepProps {
  step: ProcessStep;
  /** 1-based position, drawn as the ghost numeral on the card. */
  index: number;
  /**
   * Whether this is the stage currently being read. Decided by the parent, not
   * here: exactly one step may be active at a time, and a component can only
   * see itself.
   */
  active: boolean;
  /** Lets the parent measure this step's node against the spine head. */
  nodeRef?: (element: HTMLDivElement | null) => void;
}

/**
 * One stage on the mock placement rail: a node on the spine, and the card
 * beside it.
 *
 * The node is opaque on purpose. The spine runs behind the whole column, and
 * the node covering it is what makes the line appear to run *between* stages
 * rather than straight through them.
 */
export function TimelineStep({ step, index, active, nodeRef }: TimelineStepProps) {
  const { title, description, icon: Icon, timing, action } = step;

  return (
    <div className="gap-md tablet:gap-lg group flex items-start">
      {/* Node */}
      <div
        ref={nodeRef}
        aria-hidden="true"
        className={cn(
          'tablet:size-12 relative flex size-10 shrink-0 items-center justify-center rounded-lg border',
          'duration-base ease-out-brand transition-[background-color,border-color,color,box-shadow]',
          active
            ? 'bg-accent border-accent text-accent-fg shadow-md'
            : 'bg-surface-raised border-border text-text-muted shadow-sm',
        )}
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

        <Card
          padding="lg"
          className={cn(
            'relative overflow-hidden',
            'duration-base ease-out-brand transition-[border-color,box-shadow]',
            active ? 'border-border-strong shadow-lg' : 'shadow-sm',
          )}
        >
          {/* Ghost numeral. Decorative — the <ol> carries the real ordering, so
              it stays out of the accessibility tree. Hidden on mobile, where
              there is not enough card width for it to sit clear of the title. */}
          <span
            aria-hidden="true"
            className="text-border font-display tablet:block pointer-events-none absolute top-2 right-4 hidden text-[4.5rem] leading-none font-bold select-none"
          >
            {String(index).padStart(2, '0')}
          </span>

          <div className="relative">
            <h3 className="text-h3">{title}</h3>
            <p className="text-body text-text-muted mt-sm max-w-content-narrow">{description}</p>

            {action && (
              <div className="mt-lg">
                <Button
                  href={action.href}
                  variant="secondary"
                  size="sm"
                  iconRight={
                    <ArrowUpRight
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="duration-fast ease-out-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  }
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
