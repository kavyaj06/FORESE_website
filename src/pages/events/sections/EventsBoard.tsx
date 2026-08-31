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
 * How a row arrives, and how a whole list leaves.
 *
 * Each row triggers on its own arrival in the viewport rather than on mount.
 * That distinction matters here: a page of rows is taller than the screen on
 * every phone and most laptops, so an orchestrated stagger fired at mount
 * plays out mostly below the fold, and by the time you scroll down the later
 * rows are already sitting there finished. Per-row `whileInView` means the
 * cascade follows you down the page instead of racing ahead of you.
 *
 * Rows stand up as they appear: tipped back and slightly low, rotating flat as
 * they settle. A plain fade-and-rise reads as content appearing; this reads as
 * content arriving.
 *
 * The index delay still gives a stagger, because it is measured from each
 * row's own trigger rather than from a shared clock — rows already on screen
 * together cascade, and a row met later still gets its small beat. It is
 * capped so a full page of rows never ends on a long wait.
 */
const ROW: Variants = {
  hidden: { opacity: 0, y: 26, rotateX: -14, transformPerspective: 1200 },
  visible: { opacity: 1, y: 0, rotateX: 0, transformPerspective: 1200 },
};

/** Reduced motion: the same two states, opacity only, nothing moving. */
const FADE: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/**
 * Seconds between rows, and the ceiling on the accumulated delay.
 *
 * This only bites when several rows do trigger together — a filter switch,
 * or a short list that fits the screen at once. Scrolling normally, the
 * viewport threshold has already separated them and each row's delay is just
 * a short beat before it stands up.
 */
const ROW_STEP = 0.07;
const MAX_DELAY = 0.35;

/**
 * Rows reveal once, and one at a time.
 *
 * The threshold is what enforces "one at a time". A low `amount` fires as soon
 * as any sliver of a row clears the fold, and since rows are roughly a third
 * of a screen apart, three or four cross that line inside a single flick of
 * the wheel and light as a block. Requiring 40% of the row spaces the triggers
 * a full row-height of scrolling apart — so each event answers its own
 * arrival rather than the list answering the scroll.
 *
 * No negative bottom margin, deliberately. Pulling the trigger line up the
 * screen as well left a row that was two-thirds visible at the bottom edge
 * still blank, which after a filter click reads as a row that failed to
 * render rather than one waiting its turn. `amount` alone sets the spacing;
 * the margin only ever added that failure mode.
 */
const VIEWPORT = { once: true, amount: 0.4 } as const;

/**
 * The outgoing list leaves as one block, not row by row.
 *
 * It is no longer information, so it should be gone rather than performed —
 * a reversed stagger on the way out just makes every filter click feel slow.
 * The incoming rows are held back by `ENTER_DELAY` until it has nearly
 * finished, so the two lists share the same grid cell without the reader ever
 * seeing two sets of text stacked on each other.
 */
const LIST_EXIT = { opacity: 0, y: -12, transition: { duration: 0.16, ease: 'easeIn' } } as const;
const ENTER_DELAY = 0.14;

/**
 * Hover carries its own transition rather than inheriting the row's. The row's
 * `transition` prop holds the entrance delay, and a hover that waits half a
 * second before responding does not read as a hover at all. A spring is right
 * here for the same reason: this one answers the pointer, not the scroll.
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
                // The list owns only its exit. Enter is left to the rows, so
                // that each can wait for its own turn on screen — a parent
                // `animate` here would drive all of them at once and take
                // that back.
                exit={prefersReducedMotion ? { opacity: 0 } : LIST_EXIT}
                className="gap-md flex flex-col [grid-area:1/1]"
              >
                {visible.map((event, index) => (
                  <motion.li
                    key={event.id}
                    variants={prefersReducedMotion ? FADE : ROW}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT}
                    transition={{
                      duration: prefersReducedMotion ? 0.2 : 0.45,
                      ease: EASE_OUT_BRAND,
                      delay: ENTER_DELAY + Math.min(index * ROW_STEP, MAX_DELAY),
                    }}
                    // Hover lifts the whole row a little. Kept on the outer
                    // element rather than inside the card so it composes with
                    // Tilt3D's rotation instead of fighting it for the same
                    // transform.
                    whileHover={prefersReducedMotion ? undefined : HOVER}
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
