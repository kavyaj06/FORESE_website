import { Check } from 'lucide-react';
import { Card } from '@/components/ui';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import type { StrategyColumn } from '../data';

interface StrategyColumnsProps {
  columns: StrategyColumn[];
}

/**
 * Three checklists — before speaking, while speaking, and the room itself.
 *
 * Real lists, so a screen reader announces how many points are in each and a
 * reader skimming on a phone gets them one under the other rather than as a
 * paragraph of advice with full stops in it.
 */
export function StrategyColumns({ columns }: StrategyColumnsProps) {
  return (
    <Reveal staggerChildren className="gap-lg desktop:grid-cols-3 grid grid-cols-1">
      {columns.map(({ icon: Icon, title, points }) => (
        <RevealItem key={title} className="h-full">
          <Card padding="lg" className="h-full">
            <div className="gap-sm flex items-center">
              <span
                aria-hidden="true"
                className="border-border bg-surface text-text flex size-10 items-center justify-center rounded-md border"
              >
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <h4 className="text-body font-semibold">{title}</h4>
            </div>

            <ul className="mt-lg gap-sm flex flex-col">
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
        </RevealItem>
      ))}
    </Reveal>
  );
}
