import { Card } from '@/components/ui';
import type { TipItem } from '../data';
import { cn } from '@/lib/cn';
import { IconChip } from './IconChip';

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
 * adds under that prop is a promise of a click that never comes. What they do
 * instead, now that the club's reviewers have called the page static, is
 * answer the pointer without moving — the chip fills and a rule draws itself
 * under the title. Nothing here changes the card's position, so a reader
 * running the cursor down a grid of six is not watching six cards jump.
 *
 * The title is a `h4` at body size rather than `text-h3`, which is the size
 * the block headings above these cards use. A card title matching its own
 * section heading flattens the hierarchy exactly where the reader is relying
 * on it to skim.
 */
export function TipCard({ item, index, className }: TipCardProps) {
  const { icon: Icon, title, body } = item;

  return (
    <Card
      padding="lg"
      className={cn(
        'group/tip gap-sm flex h-full flex-col',
        'duration-base ease-out-brand hover:border-border-strong transition-colors',
        className,
      )}
    >
      <div className="mb-xs flex items-start justify-between">
        <IconChip icon={Icon} />
        {index !== undefined && (
          <span className="text-eyebrow text-text-subtle tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      <h4 className="text-body font-semibold">{title}</h4>

      {/* Drawn with a transform, so it costs nothing to run and does not
          reflow the paragraph under it the way an animated width would. */}
      <span
        aria-hidden="true"
        className="bg-accent duration-slow ease-out-brand h-px w-10 origin-left scale-x-0 transition-transform group-hover/tip:scale-x-100"
      />

      <p className="text-small text-text-muted">{body}</p>
    </Card>
  );
}
