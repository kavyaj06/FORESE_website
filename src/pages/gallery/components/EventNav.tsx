import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/cn';
import type { ForeseEvent } from '@/data/events';

interface EventNavProps {
  events: ForeseEvent[];
  /** Id of the album currently in view. Decided by the parent. */
  activeId: string | null;
}

/**
 * Sticky album switcher.
 *
 * A gallery grouped by event is only navigable if you can get to an event
 * without scrolling past the ones before it. These are anchor links rather
 * than buttons with scroll handlers, so they work with middle-click, are
 * shareable as URLs, and land correctly on a page load with a hash.
 *
 * Sticks below the site header, which is `h-16`.
 */
export function EventNav({ events, activeId }: EventNavProps) {
  return (
    <div className="border-border bg-bg/85 sticky top-16 z-30 border-b backdrop-blur-md">
      <Container>
        {/* Horizontally scrollable on narrow screens rather than wrapping to
            two rows, which would change the sticky bar's height as you scroll. */}
        <nav
          aria-label="Jump to event"
          className="gap-xs -mx-1 flex scrollbar-none overflow-x-auto px-1 py-3"
        >
          {events.map((event) => {
            const isActive = event.id === activeId;
            return (
              <a
                key={event.id}
                href={`#${event.slug}`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'text-label rounded-pill duration-fast ease-out-brand shrink-0 border px-3.5 py-2 whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-accent border-accent text-accent-fg'
                    : 'border-border text-text-muted hover:border-border-strong hover:text-text',
                )}
              >
                {event.name}
              </a>
            );
          })}
        </nav>
      </Container>
    </div>
  );
}
