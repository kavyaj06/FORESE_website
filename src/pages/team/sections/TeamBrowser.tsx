import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import { SegmentedTabs } from '@/components/sections/SegmentedTabs';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { TeamId } from '@/data/teamIds';
import { CLUB_MEMBERS, type ClubMember, type MemberRank } from '@/data/team';
import { CLUB_TEAMS } from '@/data/teams';
import { MemberCard } from '../components/MemberCard';
import { TEAM_CORE_TABS, TEAM_GROUP_TABS } from '../data';

type Group = 'core' | 'senior-member' | 'member';
type CoreRank = Extract<MemberRank, 'senior-core' | 'junior-core' | 'lead'>;
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

  const byRank = useMemo(() => {
    const map = {} as Record<MemberRank, ClubMember[]>;
    for (const member of CLUB_MEMBERS) (map[member.rank] ??= []).push(member);
    return map;
  }, []);

  const groupTabs = TEAM_GROUP_TABS.map((tab) => ({
    ...tab,
    count:
      tab.id === 'core'
        ? (byRank['senior-core']?.length ?? 0) +
          (byRank['junior-core']?.length ?? 0) +
          (byRank.lead?.length ?? 0)
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
    <section className="pb-section">
      {/* The controls get their own full-bleed band. Before this the page was
          one unbroken run of cream from the hero to the footer — the longest
          on the site, and the tabs floated in the middle of it with nothing
          to sit on. A band gives them a surface and splits the run in two. */}
      <div data-tone="panel" className="py-xl border-border border-b">
        <Container>
          <Reveal className="gap-md flex flex-col items-center">
            <SegmentedTabs
              tabs={groupTabs}
              value={group}
              onChange={setGroup}
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
                onChange={setCoreRank}
                layoutId="team-sub-pill"
                ariaLabel="Which core rank to show"
              />
            )}
            {group === 'member' && (
              <SegmentedTabs
                tabs={teamTabs}
                value={team}
                onChange={setTeam}
                layoutId="team-sub-pill"
                ariaLabel="Filter by working team"
              />
            )}
          </Reveal>
        </Container>
      </div>

      <Container>
        <div
          key={`${group}-${group === 'core' ? coreRank : team}`}
          className={
            featured
              ? 'mt-2xl gap-lg tablet:grid-cols-3 desktop:grid-cols-4 grid grid-cols-2'
              : 'mt-2xl gap-lg tablet:grid-cols-4 desktop:grid-cols-5 grid grid-cols-2'
          }
        >
          {visible.map((member, index) => (
            <motion.div
              key={member.id}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              // Staggered by column rather than by position in the list, so the
              // hundredth card is not still waiting three seconds in. It reads
              // as one sweep across the grid either way.
              transition={{
                duration: 0.3,
                delay: prefersReducedMotion ? 0 : (index % (featured ? 4 : 5)) * 0.05,
                ease: EASE_OUT_BRAND,
              }}
            >
              <MemberCard member={member} size={featured ? 'feature' : 'standard'} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
