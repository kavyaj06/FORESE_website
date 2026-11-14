import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
import type { ClubMember } from '@/data/team';
import type { TeamId } from '@/data/teamIds';
import { CLUB_TEAMS } from '@/data/teams';
import { TEAM_GALLERY } from '../data';
import { MemberPortrait } from './MemberPortrait';

/**
 * The membership as a gallery: a grid of portraits, and one of them large.
 *
 * Built to the reference the club supplied. A structured grid on the left, a
 * single featured portrait held on the right, and the rest of the grid
 * stepping back once somebody has been picked.
 *
 * **A real grid, explicitly.** The brief rules out scattered cards, random
 * offsets and masonry, and this is a plain CSS grid: equal columns, one gap,
 * one aspect ratio. Nothing is positioned by hand, so adding a person cannot
 * put a hole in it.
 *
 * **The featured panel is sticky, not fixed.** There are 84 people in the
 * larger of the two ranks and the grid is several screens tall; sticky keeps
 * the portrait beside whatever part of the grid is on screen, and still lets
 * it scroll away with the section rather than hanging over the footer.
 *
 * **The grid dims only while you are in it.** Move the mouse across it, or
 * tab through it, and everyone but the face you are on falls back; leave it
 * and they all come back, while the large portrait keeps showing the last
 * person you were on. A tap on a phone features somebody without dimming
 * anyone, because a finger has no "leaving" to undo a dim with.
 *
 * **The portraits arrive as they scroll into view**, once each, sweeping
 * across a row rather than down the whole list.
 *
 * **The working teams sit under the portrait.** Picking one dims everybody
 * outside it, so the team reads as a shape across the whole grid instead of
 * being lifted out into a shorter list. Dimming rather than filtering is the
 * point: the reader sees who is in the team *among* the membership.
 *
 * Two kinds of dimming, then, and reduced motion treats them differently. The
 * pick dimming is emphasis, so under `prefers-reduced-motion` it does not
 * happen at all. The team dimming is the reader's own filter — information,
 * not decoration — so it still applies there, instantly rather than as a fade.
 */
export function MemberGallery({ members }: { members: ClubMember[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState<TeamId | null>(null);
  /**
   * Whether the reader is in the grid right now: a mouse over it, or keyboard
   * focus inside it.
   *
   * Separate from `pickedId` on purpose. The two used to be one thing, so the
   * first hover set a pick that nothing ever cleared, and the whole wall sat
   * dimmed for good after a single pass of the cursor. Now the pick outlives
   * the hover — the panel keeps showing the last face you were on — but the
   * dimming only lasts as long as you are actually over the grid.
   */
  const [inGrid, setInGrid] = useState(false);

  // A different rank arrived; whoever was picked, and whichever team was on,
  // describe a group that is no longer on screen.
  useEffect(() => {
    setPickedId(null);
    setActiveTeam(null);
    setInGrid(false);
  }, [members]);

  /**
   * Each working team and how many of this rank are in it.
   *
   * Counted off the roster rather than stored, so a team fills in on its own
   * the day people are assigned to it.
   */
  const teams = useMemo(
    () =>
      CLUB_TEAMS.map((team) => ({
        ...team,
        count: members.filter((member) => member.team === team.id).length,
      })),
    [members],
  );

  // With a team on, the portrait is chosen from inside it, so the panel never
  // features somebody the grid has just dimmed.
  const pool = activeTeam ? members.filter((member) => member.team === activeTeam) : members;
  const featured = pool.find((member) => member.id === pickedId) ?? pool[0] ?? members[0];

  const isDimmed = (member: ClubMember) =>
    activeTeam !== null
      ? member.team !== activeTeam
      : !prefersReducedMotion && inGrid && member.id !== featured?.id;

  if (!featured) return null;

  return (
    <div className="gap-xl desktop:gap-2xl desktop:grid-cols-[1fr_20rem] wide:desktop:grid-cols-[1fr_24rem] grid grid-cols-1">
      {/* The panel comes first in the source so a phone, which stacks, meets
          the person before the wall of faces. At desktop the grid is pulled
          back into the first column, so reading order and visual order agree
          at both widths without duplicating the markup. */}
      <div className="desktop:order-2">
        <div className="desktop:sticky desktop:top-28 gap-lg flex flex-col">
          <motion.figure
            // Keyed on the person, so a new portrait arrives rather than one
            // face cross-dissolving into another.
            key={featured.id}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-surface-inverse relative overflow-hidden rounded-lg"
          >
            <div className="aspect-[3/4] w-full">
              <MemberPortrait member={featured} />
            </div>

            {/* Its own layer, so the caption above it does not have to own a
                background at all. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
            />

            <figcaption
              data-theme="inverse"
              data-rules="off"
              // The inverse theme is here for its text colours — white, and a
              // light grey under it — but it also paints a background, which
              // sat under the gradient and turned it into a solid black bar
              // below the photograph instead of a wash across it. Inline,
              // because a utility class ties with the theme block on
              // specificity and the winner is then down to stylesheet order.
              style={{ backgroundColor: 'transparent' }}
              className="p-lg absolute inset-x-0 bottom-0"
            >
              <p className="text-h3">{featured.name}</p>
              <p className="text-body text-text-muted">
                {featured.role ?? TEAM_GALLERY.ranks[featured.rank] ?? TEAM_GALLERY.noRole}
              </p>
            </figcaption>
          </motion.figure>

          <nav aria-label={TEAM_GALLERY.teamsLabel}>
            <p className="text-eyebrow text-text-subtle mb-xs uppercase">
              {TEAM_GALLERY.teamsLabel}
            </p>
            <ul className="divide-border border-border flex flex-col divide-y border-y">
              {teams.map((team) => {
                const active = team.id === activeTeam;
                const empty = team.count === 0;

                return (
                  <li key={team.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      // Disabled rather than hidden when nobody is in it. A
                      // team with no members dimmed every face on the page,
                      // which read as the gallery breaking rather than as an
                      // empty team — and leaving it in the list keeps the
                      // five teams the club has visible either way.
                      disabled={empty}
                      onClick={() => {
                        setActiveTeam((current) => (current === team.id ? null : team.id));
                        setPickedId(null);
                      }}
                      className={cn(
                        'text-body py-sm flex w-full items-center justify-between text-left',
                        'duration-fast ease-out-brand transition-colors',
                        active
                          ? 'text-accent font-semibold'
                          : 'text-text hover:text-accent disabled:text-text-subtle',
                        empty && 'cursor-not-allowed',
                      )}
                    >
                      <span className="gap-sm flex items-center">
                        {/* The mark beside the team that is on. Drawn on every
                            row and scaled away on the rest, so turning a team
                            on costs a transform rather than a reflow. */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'bg-accent duration-base ease-out-brand size-1.5 rounded-full transition-transform',
                            active ? 'scale-100' : 'scale-0',
                          )}
                        />
                        {team.name}
                      </span>
                      <span className="text-small text-text-subtle tabular-nums">{team.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      <ul
        className="gap-md tablet:grid-cols-4 desktop:grid-cols-5 desktop:order-1 grid grid-cols-3"
        // Leaving the grid, by mouse or by tabbing out of it, lifts the
        // dimming. The featured portrait stays where it was.
        onPointerLeave={() => setInGrid(false)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInGrid(false);
        }}
      >
        {members.map((member, index) => {
          const isPicked = member.id === featured.id && pickedId !== null;
          const dimmed = isDimmed(member);

          const tile = (
            <button
              type="button"
              aria-pressed={isPicked}
              aria-label={TEAM_GALLERY.pick.replace('{name}', member.name)}
              // A tap features the person and dims nothing. Touch has no
              // "leaving" to undo a dim with, so a dim set by a finger would
              // be the same stuck wall this was rewritten to stop.
              onClick={() => setPickedId(member.id)}
              // A mouse, specifically, picks on the way past — that is what
              // makes it a gallery the panel follows across rather than a
              // list of buttons. Pointer events rather than mouse events
              // because a phone fires an emulated mouseenter on every tap.
              onPointerEnter={(event) => {
                if (event.pointerType !== 'mouse') return;
                setPickedId(member.id);
                setInGrid(true);
              }}
              // Keyboard focus does the same, but only real keyboard focus:
              // a click also focuses the button, and that should not count.
              onFocus={(event) => {
                if (!event.currentTarget.matches(':focus-visible')) return;
                setPickedId(member.id);
                setInGrid(true);
              }}
              className={cn(
                'bg-surface-inverse block w-full overflow-hidden rounded-md',
                !prefersReducedMotion && 'ease-out-brand transition-opacity duration-300',
                // A team's outsiders sit lower than a hover's: the team is the
                // reader's own choice and should read as decided.
                dimmed && (activeTeam ? 'opacity-20' : 'opacity-25'),
              )}
            >
              <span className="block aspect-[3/4] w-full">
                <MemberPortrait member={member} />
              </span>
            </button>
          );

          // Reduced motion gets the plain list item: no entrance at all,
          // rather than the same entrance played quicker.
          if (prefersReducedMotion) return <li key={member.id}>{tile}</li>;

          return (
            <motion.li
              key={member.id}
              /**
               * The scroll entrance lives on the list item, never on the
               * button. The button's opacity is the dimming, and framer writes
               * opacity inline: on the same element its `1` would beat the
               * dim class and the hover would stop working. Nested, the two
               * opacities simply multiply.
               *
               * Once, not on every pass. The site's own `Reveal` replays as
               * you scroll back up, and across 140 portraits that would be
               * the grid re-dealing itself under the reader's thumb.
               */
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 'some', margin: '0px 0px -60px 0px' }}
              transition={{
                duration: 0.55,
                ease: EASE_OUT_BRAND,
                // Across the row rather than down the whole list, so a row
                // arriving together sweeps left to right instead of the last
                // portraits waiting seconds for the first eighty.
                delay: (index % 5) * 0.06,
              }}
            >
              {tile}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
