import { Card } from '@/components/ui';
import type { TipItem } from '../data';
import { cn } from '@/lib/cn';

interface TipCardProps {
  item: TipItem;
  /**
   * Zero-based position, printed as 01, 02, 03 in the corner.
   *
   * Only for lists whose order is part of the content — the aptitude
   * objectives are numbered in the club's own material. Omit it on a set
   * whose order is arbitrary, where a number claims a sequence that is not
   * there.
   */
  index?: number;
  className?: string;
}

/**
 * Icon, title, paragraph — the page's most repeated unit.
 *
 * Deliberately not `interactive`: these cards go nowhere, and the lift Card
 * adds under that prop is a promise of a click that never comes.
 *
 * The title is a `h4` at body size rather than `text-h3`, which is the size
 * the block headings above these cards use. A card title matching its own
 * section heading flattens the hierarchy exactly where the reader is relying
 * on it to skim.
 */
export function TipCard({ item, index, className }: TipCardProps) {
  const { icon: Icon, title, body } = item;

  return (
    <Card padding="lg" className={cn('gap-sm flex h-full flex-col', className)}>
      <div className="mb-xs flex items-start justify-between">
        <span
          aria-hidden="true"
          className="border-border bg-surface text-text flex size-10 items-center justify-center rounded-md border"
        >
          <Icon size={18} strokeWidth={1.75} />
        </span>
        {index !== undefined && (
          <span className="text-eyebrow text-text-subtle tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      <h4 className="text-body font-semibold">{title}</h4>
      <p className="text-small text-text-muted">{body}</p>
    </Card>
  );
}
