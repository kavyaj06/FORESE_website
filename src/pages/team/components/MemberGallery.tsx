import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
 * **The grid does not dim until it has been used.** Untouched, every portrait
 * is at full strength; once a face has been picked the others fall back so the
 * chosen one reads. Dimming on arrival would make a reader's first sight of
 * the membership a wall of faded photographs.
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

  // A different rank arrived; whoever was picked, and whichever team was on,
  // describe a group that is no longer on screen.
  useEffect(() => {
    setPickedId(null);
    setActiveTeam(null);
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
      : !prefersReducedMotion && pickedId !== null && member.id !== featured?.id;

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

      <ul className="gap-md tablet:grid-cols-4 desktop:grid-cols-5 desktop:order-1 grid grid-cols-3">
        {members.map((member) => {
          const isPicked = member.id === featured.id && pickedId !== null;
          const dimmed = isDimmed(member);

          return (
            <li key={member.id}>
              <button
                type="button"
                aria-pressed={isPicked}
                aria-label={TEAM_GALLERY.pick.replace('{name}', member.name)}
                onClick={() => setPickedId(member.id)}
                // Hover and focus pick too, which is what makes it a gallery
                // rather than a list of buttons: on a pointer device the
                // featured panel follows the cursor across the wall.
                onMouseEnter={() => setPickedId(member.id)}
                onFocus={() => setPickedId(member.id)}
                className={cn(
                  'bg-surface-inverse block w-full overflow-hidden rounded-md',
                  !prefersReducedMotion && 'ease-out-brand transition-opacity duration-300',
                  // A team's outsiders stay dim under the pointer: the team is
                  // the reader's own choice and hovering past it should not
                  // undo it. The pick dimming lifts on hover, as before.
                  dimmed && (activeTeam ? 'opacity-20' : 'opacity-25 hover:opacity-100'),
                )}
              >
                <span className="block aspect-[3/4] w-full">
                  <MemberPortrait member={member} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
