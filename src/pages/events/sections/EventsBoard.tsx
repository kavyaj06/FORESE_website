import { useMemo, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { Tilt3D } from '@/components/motion/Tilt3D';
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
 * The list swap.
 *
 * Enter is staggered — rows stand up one after another, tipped back and
 * slightly low, rotating flat as they settle. A plain fade-and-rise reads as
 * content appearing; this reads as content arriving.
 *
 * Exit is not staggered, and is roughly a third of the duration. The outgoing
 * list is not information any more, so it should be gone, not performed; a
 * reversed stagger on the way out just makes every filter click feel slow.
 * `delayChildren` on the enter side holds the new rows back until the old ones
 * have nearly finished, so the two lists overlap in the same grid cell without
 * the reader ever seeing two sets of text on top of each other.
 */
const LIST: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.14 } },
  exit: { transition: { staggerChildren: 0 } },
};

const ROW: Variants = {
  hidden: { opacity: 0, y: 26, rotateX: -14, transformPerspective: 1200 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transformPerspective: 1200,
    transition: { duration: 0.45, ease: EASE_OUT_BRAND },
  },
  exit: {
    opacity: 0,
    y: -14,
    rotateX: 8,
    transformPerspective: 1200,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
};

/** Reduced motion: the same three states, opacity only. */
const FADE: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

/** Hover is a separate, springier transition — it answers the pointer, not the scroll. */
const HOVER = { type: 'spring', stiffness: 320, damping: 26 } as const;

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
          <div data-events-stack className="mt-2xl grid" style={{ perspective: 1200 }}>
            <AnimatePresence initial={false}>
              <motion.ul
                // Keyed by the filter and page, so no row is ever shared
                // between two states. This is the whole fix for rows sliding
                // across the screen when you moved from Completed to All: a
                // row present in both lists kept its key, and `layout` then
                // did exactly what it is for — animated it from its old
                // position to its new one. Correct behaviour, wrong effect.
                // Switching a filter is a replacement, not a rearrangement.
                key={`${filter}-${safePage}`}
                variants={prefersReducedMotion ? undefined : LIST}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="gap-md flex flex-col [grid-area:1/1]"
              >
                {visible.map((event) => (
                  <motion.li
                    key={event.id}
                    variants={prefersReducedMotion ? FADE : ROW}
                    // Hover lifts the whole row a little. Kept on the outer
                    // element rather than inside the card so it composes with
                    // Tilt3D's rotation instead of fighting it for the same
                    // transform.
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
                    transition={HOVER}
                    className="[transform-origin:50%_100%]"
                  >
                    <Tilt3D max={3} perspective={1600} liftZ={14}>
                      <EventRow event={event} photoCount={albumFor(event.id)?.photos.length ?? 0} />
                    </Tilt3D>
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
