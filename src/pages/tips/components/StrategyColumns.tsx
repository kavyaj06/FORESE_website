import { Check } from 'lucide-react';
import { Card } from '@/components/ui';
import type { StrategyColumn } from '../data';
import { IconChip } from './IconChip';
import { ScrollSettle } from './ScrollSettle';

interface StrategyColumnsProps {
  columns: StrategyColumn[];
}

/**
 * Three checklists — before speaking, while speaking, and the room itself.
 *
 * Real lists, so a screen reader announces how many points are in each and a
 * reader skimming on a phone gets them one under the other rather than as a
 * paragraph of advice with full stops in it.
 *
 * Shares `TipCard`'s pointer response — chip fills, rule draws, card stays
 * put — because these go nowhere either.
 */
export function StrategyColumns({ columns }: StrategyColumnsProps) {
  return (
    <ScrollSettle
      className="gap-lg desktop:grid-cols-3 grid grid-cols-1"
      items={columns}
      getKey={(column) => column.title}
    >
      {({ icon: Icon, title, points }) => (
        <Card
          padding="lg"
          className="group/tip duration-base ease-out-brand hover:border-border-strong h-full transition-colors"
        >
          <div className="gap-sm flex items-center">
            <IconChip icon={Icon} />
            <h4 className="text-body font-semibold">{title}</h4>
          </div>

          {/* The same rule the tip cards draw, so the two card shapes on
                this guide answer the pointer the same way. */}
          <span
            aria-hidden="true"
            className="bg-text duration-slow ease-out-brand mt-md block h-px w-10 origin-left scale-x-0 transition-transform group-hover/tip:scale-x-100"
          />

          <ul className="mt-md gap-sm flex flex-col">
            {points.map((point) => (
              <li key={point} className="gap-sm text-small text-text-muted flex items-start">
                <Check
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="text-text mt-0.5 shrink-0"
                />
                {point}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </ScrollSettle>
  );
}
