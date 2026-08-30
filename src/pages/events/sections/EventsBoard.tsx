import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { eventStatus, groupEventsByStatus, type ForeseEvent } from '@/data/events';
import { albumFor } from '@/pages/gallery/data';
import { EventFilterTabs, type EventFilter } from '../components/EventFilterTabs';
import { EventRow } from '../components/EventRow';
import { FeaturedCarousel } from '../components/FeaturedCarousel';
import { EVENT_GROUPS } from '../data';

/** Rows shown before paging. Enough to fill a screen without burying the tabs. */
const PAGE_SIZE = 5;

/**
 * The events board: a featured carousel, a filter, and the list.
 *
 * The three states are now a filter rather than three stacked sections. With
 * one shared card shape a reader can compare events down the list; with three
 * different layouts they could only compare within a group. The tabs carry
 * counts, so the split is still visible at a glance without scrolling to find
 * out whether a section has anything in it.
 *
 * Anything current — running now or still to come — leads the page in the
 * carousel. That is the part of this page somebody might act on.
 */
export function EventsBoard() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [filter, setFilter] = useState<EventFilter>('all');
  const [page, setPage] = useState(0);

  const groups = useMemo(() => groupEventsByStatus(), []);
  const featured = useMemo(
    () => [...groups.ongoing, ...groups.upcoming.filter((event) => event.date)],
    [groups],
  );

  const all = useMemo<ForeseEvent[]>(
    () => [...groups.ongoing, ...groups.upcoming, ...groups.completed],
    [groups],
  );

  const counts: Record<EventFilter, number> = {
    all: all.length,
    ongoing: groups.ongoing.length,
    upcoming: groups.upcoming.length,
    completed: groups.completed.length,
  };

  const filtered = useMemo(
    () => (filter === 'all' ? all : all.filter((event) => eventStatus(event) === filter)),
    [all, filter],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const changeFilter = (next: EventFilter) => {
    setFilter(next);
    // Back to the first page: staying on page 3 of a filter that now has one
    // page shows an empty list and looks like a bug.
    setPage(0);
  };

  return (
    <section className="py-section">
      <Container>
        {featured.length > 0 && (
          <Reveal motionStyle="scale">
            <FeaturedCarousel events={featured} />
          </Reveal>
        )}

        <Reveal className={featured.length > 0 ? 'mt-3xl' : ''}>
          <EventFilterTabs value={filter} onChange={changeFilter} counts={counts} />
        </Reveal>

        {visible.length === 0 ? (
          <p className="text-body text-text-muted mt-2xl">
            {filter === 'completed' ? EVENT_GROUPS.completed.empty : EVENT_GROUPS.upcoming.empty}
          </p>
        ) : (
          <motion.ul layout={!prefersReducedMotion} className="mt-2xl gap-md flex flex-col">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((event) => (
                <motion.li
                  key={event.id}
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_BRAND }}
                >
                  <EventRow event={event} photoCount={albumFor(event.id)?.photos.length ?? 0} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}

        {pageCount > 1 && (
          <nav aria-label="Events pages" className="mt-2xl gap-xs flex items-center justify-center">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-current={i === safePage ? 'page' : undefined}
                aria-label={`Page ${i + 1}`}
                className={cnPage(i === safePage)}
              >
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}
          </nav>
        )}
      </Container>
    </section>
  );
}

function cnPage(active: boolean) {
  return [
    'text-caption rounded-pill duration-fast size-10 tabular-nums transition-colors',
    active
      ? 'bg-accent text-accent-fg'
      : 'text-text-muted hover:text-text hover:bg-surface border border-border',
  ].join(' ');
}
