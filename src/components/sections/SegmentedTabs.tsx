import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

export interface SegmentedTab<T extends string> {
  id: T;
  label: string;
  /** Shown after the label. Omit where there is nothing to count. */
  count?: number;
  disabled?: boolean;
}

interface SegmentedTabsProps<T extends string> {
  tabs: SegmentedTab<T>[];
  value: T;
  onChange: (next: T) => void;
  /**
   * Must be unique per mounted control. Two tab strips sharing a `layoutId`
   * animate one pill between them, across the page.
   */
  layoutId: string;
  ariaLabel: string;
  className?: string;
}

/**
 * A row of tabs with a pill that slides to the selected one.
 *
 * Real tabs, wired to `role="tablist"` with arrow-key navigation, rather than
 * buttons that happen to look like tabs — a screen reader should be told this
 * is a set of choices with one selected, not read a row of unrelated buttons.
 *
 * The selected pill is one element moving (`layoutId`), not one background
 * fading in while another fades out. One object moving is legible; several
 * things blinking is noise.
 *
 * A tab with nothing behind it is disabled rather than hidden. Tabs that come
 * and go change the width of the control between renders, and a control that
 * silently loses an option looks broken.
 *
 * The strip scrolls inside itself when it is wider than the space it is given,
 * and the selected tab is kept in view after a change the reader made. Six
 * team tabs overflow a phone, and arrow keys move the selection without moving
 * the scroll — so the pill would slide to a tab past the edge and the control
 * would look like it had stopped responding. Never on mount, though: see the
 * note on the effect.
 *
 * Promoted out of the events filter once a third caller appeared, per the
 * repo's rule that components move up only when a second page needs them.
 */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  layoutId,
  ariaLabel,
  className,
}: SegmentedTabsProps<T>) {
  const selectedRef = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    // Not on mount. `block: 'nearest'` scrolls vertically too when the strip
    // is below the fold, so a control that merely existed further down the
    // page dragged the reader to it the moment the page loaded — landing on
    // /mocks jumped past the hero and the About section entirely. Only a
    // selection the reader actually made should move anything.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    selectedRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [value]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = tabs.length - 1;
    const current = tabs.findIndex((tab) => tab.id === value);

    const next =
      event.key === 'ArrowRight'
        ? (current + 1) % tabs.length
        : event.key === 'ArrowLeft'
          ? (current - 1 + tabs.length) % tabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1;

    if (next === -1) return;
    event.preventDefault();
    onChange(tabs[next].id);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        'border-border bg-surface gap-xs rounded-pill flex w-fit max-w-full scrollbar-none overflow-x-auto border p-1',
        className,
      )}
    >
      {tabs.map((tab) => {
        const selected = tab.id === value;
        const disabled = tab.disabled ?? tab.count === 0;

        return (
          <button
            key={tab.id}
            ref={selected ? selectedRef : undefined}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'text-label rounded-pill duration-fast relative shrink-0 px-4 py-2 whitespace-nowrap transition-colors',
              selected ? 'text-accent-fg' : 'text-text-muted hover:text-text',
              disabled && 'hover:text-text-muted cursor-not-allowed opacity-40',
            )}
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className="bg-accent rounded-pill absolute inset-0"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative">
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 tabular-nums opacity-60">{tab.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
