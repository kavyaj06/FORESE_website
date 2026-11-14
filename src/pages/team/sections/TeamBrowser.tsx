import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import { SegmentedTabs } from '@/components/sections/SegmentedTabs';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
import type { TeamId } from '@/data/teamIds';
import { CLUB_MEMBERS, type ClubMember, type MemberRank } from '@/data/team';
import { byRoleThenName, CLUB_TEAMS, CORE_RANKS } from '@/data/teams';
import { CoreFan } from '../components/CoreFan';
import { MemberGallery } from '../components/MemberGallery';
import { MemberCard } from '../components/MemberCard';
import { TEAM_CORE_TABS, TEAM_GROUP_TABS } from '../data';

type Group = 'core' | 'senior-member' | 'member';
type CoreRank = Extract<MemberRank, 'senior-core' | 'junior-core' | 'lead' | 'senior-executive'>;
type TeamFilter = 'all' | TeamId;

/**
 * The whole roster behind two rows of tabs.
 *
 * This replaced three stacked sections — senior core, junior core, members —
 * that ran to five screens of scrolling before a reader reached the second
 * rank. Five ranks and five teams cannot be stacked: as sections it would be
 * ten headings, and a reader looking for one person would scroll past a
 * hundred and nine faces to find out whether they were in the list at all.
 *
 * Two rows rather than one flat row of eight. The first row is what someone
 * *is* — core, senior member, member — and the second is a division inside
 * that, which is a different question and changes with the answer to the
 * first. Flattened into one row the two would read as eight peers, and a
 * reader would have no way to tell that Junior Core and Marketing are not the
 * same kind of thing.
 *
 * The second row keeps its own selection per group, so switching to Members
 * and back does not silently reset which core rank was being read.
 *
 * No `AnimatePresence`: its exit callback has already white-screened a
 * production build on this site. Cards leave the instant the filter changes
 * and the arriving set animates in, keyed on the selection so React mounts a
 * genuinely new grid rather than diffing one list into another — which is what
 * made the events filter FLIP rows across the screen before it was keyed.
 */
export function TeamBrowser() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [group, setGroup] = useState<Group>('core');
  const [coreRank, setCoreRank] = useState<CoreRank>('senior-core');
  const [team, setTeam] = useState<TeamFilter>('all');

  /**
   * The one card opened by tap, on a touch screen.
   *
   * Here rather than inside each card because only the grid can see that a
   * second card has been tapped — see the note in `MemberCard`. Cleared
   * whenever the selection changes, since the open card is usually not in the
   * set that arrives next, and a card that opens itself the moment a filter
   * changes is a card nobody asked for.
   */
  const [openId, setOpenId] = useState<string | null>(null);

  const choose =
    <T,>(set: (next: T) => void) =>
    (next: T) => {
      setOpenId(null);
      set(next);
    };

  const byRank = useMemo(() => {
    const map = {} as Record<MemberRank, ClubMember[]>;
    for (const member of CLUB_MEMBERS) (map[member.rank] ??= []).push(member);
    // Sorted by role and then by name, not left in roster order — see
    // `byRoleThenName`. The roster's order is the order people were typed in,
    // which put the President sixth in the senior core, between two general
    // secretaries, and left a hundred and forty members in no order at all.
    for (const group of Object.values(map)) group.sort(byRoleThenName);
    return map;
  }, []);

  const groupTabs = TEAM_GROUP_TABS.map((tab) => ({
    ...tab,
    count:
      tab.id === 'core'
        ? CORE_RANKS.reduce((total, rank) => total + (byRank[rank]?.length ?? 0), 0)
        : (byRank[tab.id]?.length ?? 0),
  }));

  const coreTabs = TEAM_CORE_TABS.map((tab) => ({
    ...tab,
    count: byRank[tab.id]?.length ?? 0,
  }));

  const inGroup = group === 'core' ? (byRank[coreRank] ?? []) : (byRank[group] ?? []);

  const teamTabs = [
    { id: 'all' as TeamFilter, label: 'All', count: inGroup.length },
    ...CLUB_TEAMS.map((entry) => ({
      id: entry.id as TeamFilter,
      label: entry.name,
      count: inGroup.filter((member) => member.team === entry.id).length,
    })),
  ];

  const visible =
    group === 'member' && team !== 'all'
      ? inGroup.filter((member) => member.team === team)
      : inGroup;

  // The whole core reads at one size: senior core, junior core and leads share
  // the taller card and the four-across grid. They are one group under one
  // tab, and three different card sizes inside it would say they are three
  // different kinds of thing — the ranks are already named by the tabs.
  //
  // The size difference that remains is core against members, which is the
  // hierarchy that matters: rendered at one scale the page would say the
  // twenty-three and the ninety are interchangeable.
  const featured = group === 'core';

  return (
    <section>
      {/* The controls get a surface of their own. They are not part of the
          roster — they are how you ask for a piece of it — and on the same
          white as the hundred and sixty-five cards below them there was
          nothing to say so: the page ran one flat colour from the hero to the
          footer, which is what the club's reviewers were reacting to. */}
      <div className="bg-surface py-2xl">
        <Container>
          <Reveal className="gap-md flex flex-col items-center">
            <SegmentedTabs
              tabs={groupTabs}
              value={group}
              onChange={choose(setGroup)}
              layoutId="team-group-pill"
              ariaLabel="Which part of the club to show"
            />

            {/* Senior members get no second row. They are divided by working
              team in the data like everyone else, but the club presents them
              as one body — so a filter here would invent a distinction the
              club does not make. Members keep it, where thirty-one cards are
              worth narrowing. */}
            {group === 'core' && (
              <SegmentedTabs
                tabs={coreTabs}
                value={coreRank}
                onChange={choose(setCoreRank)}
                layoutId="team-sub-pill"
                ariaLabel="Which core rank to show"
              />
            )}
            {/* Only once somebody is actually on a working team. Nobody in
                the roster carries one today, so this row rendered five
                filters reading Design 0, Development 0, Content 0,
                Marketing 0 and Videography 0 — five ways to empty the page.
                The `all` tab is excluded from the test: it counts the whole
                group, so it is never zero and would keep the row alive on
                its own.
                Written as a condition rather than deleted, so the row comes
                back by itself the day the club fills the field in. */}
            {group === 'member' && teamTabs.some((tab) => tab.id !== 'all' && tab.count > 0) && (
              <SegmentedTabs
                tabs={teamTabs}
                value={team}
                onChange={choose(setTeam)}
                layoutId="team-sub-pill"
                ariaLabel="Filter by working team"
              />
            )}
          </Reveal>
        </Container>
      </div>

      <Container className="pt-2xl pb-section">
        <div key={`${group}-${group === 'core' ? coreRank : team}`}>
          {featured && !prefersReducedMotion ? (
            // The core ranks are a hand of cards: posts at the front, and the
            // people in a post behind it. See `CoreFan` for which ranks show
            // posts and which show people, and why that is read off the
            // roster rather than listed.
            <CoreFan members={visible} />
          ) : featured ? (
            // Reduced motion gets what this tab rendered before the fan: the
            // same people, in rows. A different tree rather than the same one
            // moving less, which is the site's rule — and a fallback this
            // page has already been shipping.
            //
            // Rows rather than a grid, for two reasons the grid could not
            // answer. A rank whose count is not a multiple of the columns left
            // its last row ranged left with empty cells beside it, and the
            // senior core has a shape of its own: one president, two vice
            // presidents, then the general secretaries. Rows that centre
            // themselves give both, and every card stays the width it would
            // have had in a five-column grid.
            <div className="gap-lg flex flex-col">
              {(coreRank === 'senior-core' ? roleRows(visible) : [visible]).map((row, rowIndex) => (
                <ul key={row[0]?.id ?? rowIndex} className="gap-lg flex flex-wrap justify-center">
                  {row.map((member, index) => (
                    // `flex` so the card fills the row's height: a grid
                    // stretched its cells and a flex line does not pass that
                    // on to a child asking for `h-full`, which left two cards
                    // side by side ending forty pixels apart.
                    <li key={member.id} className={cn(CORE_CARD, 'flex')}>
                      <Card
                        member={member}
                        index={index}
                        columns={5}
                        prefersReducedMotion={prefersReducedMotion}
                        open={openId === member.id}
                        onToggle={() =>
                          setOpenId((current) => (current === member.id ? null : member.id))
                        }
                        size="feature"
                      />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          ) : (
            // The two member ranks are a gallery: a grid of portraits with
            // one of them held large beside it. See `MemberGallery`. The
            // group tabs above are its sections — the club's roster has no
            // working team on anybody, so Senior Members and Members are the
            // only real division there is to navigate by.
            <MemberGallery members={visible} />
          )}
        </div>
      </Container>
    </section>
  );
}

/**
 * The senior core as rows: one per role, and no row longer than three.
 *
 * The club asked for it to read as what it is — the president, then the two
 * vice presidents, then the general secretaries — and the list arrives sorted
 * by role already (see `byRoleThenName`), so the rows are the runs of equal
 * role, with a long run broken up rather than stretched back into a grid.
 *
 * **Only the senior core.** The junior core holds six executive directors,
 * two tech heads, a communications chair and a treasurer, and grouping that
 * by role gives two rows holding a single centred card each, which reads as a
 * mistake rather than as a hierarchy. Every other rank is one run that wraps.
 */
const ROW = 3;

function roleRows(members: ClubMember[]): ClubMember[][] {
  const runs: ClubMember[][] = [];

  for (const member of members) {
    const last = runs[runs.length - 1];
    if (last && last[0].role === member.role) last.push(member);
    else runs.push([member]);
  }

  return runs.flatMap((run) =>
    run.length <= ROW
      ? [run]
      : Array.from({ length: Math.ceil(run.length / ROW) }, (_, i) =>
          run.slice(i * ROW, i * ROW + ROW),
        ),
  );
}

/**
 * A core card's width.
 *
 * Written out rather than left to a grid because these rows centre, and a
 * centred flex row has no columns to inherit a width from. The subtraction is
 * the gaps: four of them across the desktop row, two across three cards, one
 * across two.
 *
 * **Four and a half columns at desktop, which is not a typo.** Five came out
 * at 205px, and a core card shows its quote over the photograph rather than
 * under the name once its *content box* reaches 12rem — that is 192px inside
 * 16px of padding, so a 205px card missed it by three pixels and every core
 * member lost the reveal. 4.5 gives 227px, which clears it, is still well
 * short of the 261px the four-column grid had, and still lays four to a row.
 * The club asked for both: a little larger, and the quotes back where they
 * were. They are the same number.
 */
const CORE_CARD =
  'w-[calc((100%-1.5rem)/2)] tablet:w-[calc((100%-3rem)/3)] desktop:w-[calc((100%-6rem)/4.5)]';

/** One card, with the entrance the grid used to give it. */
function Card({
  member,
  index,
  columns,
  prefersReducedMotion,
  open,
  onToggle,
  size,
}: {
  member: ClubMember;
  index: number;
  columns: number;
  prefersReducedMotion: boolean;
  open: boolean;
  onToggle: () => void;
  size: 'feature' | 'standard';
}) {
  return (
    <motion.div
      className="w-full"
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      // Staggered by column rather than by position in the list, so the
      // hundredth card is not still waiting three seconds in. It reads as one
      // sweep across the grid either way.
      transition={{
        duration: 0.3,
        delay: prefersReducedMotion ? 0 : (index % columns) * 0.05,
        ease: EASE_OUT_BRAND,
      }}
    >
      <MemberCard member={member} size={size} open={open} onToggle={onToggle} />
    </motion.div>
  );
}
