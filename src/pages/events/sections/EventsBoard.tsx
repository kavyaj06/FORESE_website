import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { Tilt3D } from '@/components/motion/Tilt3D';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { eventStatus, groupEventsByStatus, type ForeseEvent } from '@/data/events';
import { albumFor } from '@/pages/gallery/data';
import { EventFilterTabs, type EventFilter } from '../components/EventFilterTabs';
import { EventRow } from '../components/EventRow';
import { ScrollRevealRow } from '../components/ScrollRevealRow';
import { FeaturedCarousel } from '../components/FeaturedCarousel';
import { EVENT_GROUPS } from '../data';

/** Rows shown before paging. Enough to fill a screen without burying the tabs. */
const PAGE_SIZE = 5;

/**
 * The outgoing list leaves as one block, not row by row.
 *
 * It is no longer information, so it should be gone rather than performed —
 * a reversed stagger on the way out just makes every filter click feel slow.
 * The incoming rows hold back by the same 0.16s before they begin, so the two
 * lists share the same grid cell without the reader ever seeing two sets of
 * text stacked on each other.
 *
 * This is the only animation the list owns. Each row reveals itself — from its
 * scroll position, and from having just mounted. See `ScrollRevealRow`.
 */
const LIST_EXIT = { opacity: 0, y: -12, transition: { duration: 0.16, ease: 'easeIn' } } as const;

/**
 * Hover carries its own transition. A spring is right here because it answers
 * the pointer rather than the scroll — the one piece of motion on this list
 * that is a reply to a person rather than to a position.
 */
const HOVER = {
  scale: 1.015,
  transition: { type: 'spring', stiffness: 320, damping: 26 },
} as const;

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
 *
 * The perspective sits on the list rather than on each row. Sharing one
 * vanishing point is what makes the rows read as cards on a single surface;
 * per-row perspective gives each its own private camera, and the effect falls
 * apart the moment two are on screen together.
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

  const listRef = useRef<HTMLDivElement>(null);

  /**
   * Turning a page takes the reader back to the top of the list.
   *
   * Without it `setPage` swapped the rows underneath them and left the scroll
   * where it was — halfway down page two, looking at rows four and five of a
   * list they had just asked to start again. The pagination sits at the
   * bottom, so the reader is always at the bottom when they press it, and the
   * top of the new page is the one part of it they never saw.
   *
   * `scroll-mt` on the target rather than arithmetic here, so the offset that
   * clears the sticky header lives next to the thing being cleared.
   */
  const goToPage = (next: number) => {
    setPage(next);
    listRef.current?.scrollIntoView({
      block: 'start',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

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
          /* The list is a stack, not a flow: both the outgoing and incoming
             lists occupy grid cell 1/1, so the container is always as tall as
             the taller of the two. Without that the old list unmounts, the
             section collapses to nothing for the length of the swap, and the
             pagination and footer jump up the screen and back. */
          <div
            data-events-stack
            ref={listRef}
            className="mt-2xl grid scroll-mt-28"
            style={{ perspective: 1200 }}
          >
            {/* No `initial={false}` here. It suppresses the mount animation
                for the whole subtree, which silently defeated the rows'
                scroll reveal: they rendered already-visible and only ever
                animated on a filter switch. */}
            <AnimatePresence>
              <motion.ul
                // Keyed by the filter and page, so no row is ever shared
                // between two states. This is the whole fix for rows sliding
                // across the screen when you moved from Completed to All: a
                // row present in both lists kept its key, and `layout` then
                // did exactly what it is for — animated it from its old
                // position to its new one. Correct behaviour, wrong effect.
                // Switching a filter is a replacement, not a rearrangement.
                key={`${filter}-${safePage}`}
                // Only the exit lives here. The incoming list is revealed by
                // its rows, which stagger themselves — fading the whole list
                // in on top of that would flatten the cascade back into the
                // single blink it exists to remove.
                exit={prefersReducedMotion ? { opacity: 0 } : LIST_EXIT}
                className="gap-md flex flex-col [grid-area:1/1]"
              >
                {visible.map((event, index) => (
                  <motion.li
                    key={event.id}
                    // Hover lives on the row wrapper, outside both the scroll
                    // reveal and Tilt3D, so the three compose instead of
                    // fighting for the same transform.
                    whileHover={prefersReducedMotion ? undefined : HOVER}
                  >
                    <ScrollRevealRow index={index}>
                      <Tilt3D max={3} perspective={1600} liftZ={14}>
                        <EventRow
                          event={event}
                          photoCount={albumFor(event.id)?.photos.length ?? 0}
                        />
                      </Tilt3D>
                    </ScrollRevealRow>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        )}

        {pageCount > 1 && (
          <nav aria-label="Events pages" className="mt-2xl gap-xs flex items-center justify-center">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToPage(i)}
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
