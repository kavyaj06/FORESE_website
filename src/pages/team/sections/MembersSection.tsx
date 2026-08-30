import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { TeamId } from '@/data/teamIds';
import { CLUB_TEAMS, membersByRank } from '@/data/teams';
import { MemberCard } from '../components/MemberCard';
import { TEAM_SECTIONS } from '../data';

type Filter = 'all' | TeamId;

/**
 * Members, filtered by tech team.
 *
 * This is where the three tech teams live, and why they are a filter rather
 * than three more sections. The club is presented as three ranks — senior
 * core, junior core, members — and a team is something a member is *on*, not
 * a fourth rank. Filtering keeps every person on exactly one card while still
 * letting someone see just the design team; three separate team sections would
 * either duplicate faces or fragment the roster into lists too short to scan.
 *
 * The filter also does the practical work: ninety cards at once is a wall, and
 * thirty is a page.
 *
 * Junior core carry no team of their own because they manage all three
 * together — so they are not in this list, and appear once, above.
 */
export function MembersSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [filter, setFilter] = useState<Filter>('all');

  const members = useMemo(() => membersByRank('member'), []);
  const counts = useMemo(() => {
    const base: Record<string, number> = { all: members.length };
    for (const team of CLUB_TEAMS) {
      base[team.id] = members.filter((member) => member.team === team.id).length;
    }
    return base;
  }, [members]);

  const visible = useMemo(
    () => (filter === 'all' ? members : members.filter((member) => member.team === filter)),
    [members, filter],
  );

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All members' },
    ...CLUB_TEAMS.map((team) => ({ id: team.id as Filter, label: team.name })),
  ];

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const current = tabs.findIndex((tab) => tab.id === filter);
    setFilter(tabs[(current + step + tabs.length) % tabs.length].id);
  };

  const activeTeam = CLUB_TEAMS.find((team) => team.id === filter);

  return (
    <section className="py-section">
      <Container>
        <Reveal>
          <SectionHeading title={TEAM_SECTIONS.members.title} />
        </Reveal>

        <Reveal className="mt-xl">
          <div
            role="tablist"
            aria-label="Filter members by team"
            onKeyDown={onKeyDown}
            className="border-border bg-surface gap-xs rounded-pill flex w-fit max-w-full scrollbar-none overflow-x-auto border p-1"
          >
            {tabs.map((tab) => {
              const selected = tab.id === filter;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setFilter(tab.id)}
                  className={`text-label rounded-pill duration-fast relative shrink-0 px-4 py-2 whitespace-nowrap transition-colors ${
                    selected ? 'text-accent-fg' : 'text-text-muted hover:text-text'
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="member-tab-pill"
                      aria-hidden="true"
                      className="bg-accent rounded-pill absolute inset-0"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="relative">
                    {tab.label}
                    <span className="ml-1.5 tabular-nums opacity-60">{counts[tab.id]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* What the selected team actually does. Without this the filter is
            three unexplained words. */}
        <AnimatePresence mode="wait" initial={false}>
          {activeTeam && (
            <motion.p
              key={activeTeam.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT_BRAND }}
              className="text-body text-text-muted mt-lg max-w-[58ch]"
            >
              {activeTeam.description}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div
          layout={!prefersReducedMotion}
          className="mt-2xl gap-lg tablet:grid-cols-4 desktop:grid-cols-5 grid grid-cols-2"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((member) => (
              <motion.div
                key={member.id}
                layout={!prefersReducedMotion}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: EASE_OUT_BRAND }}
              >
                <MemberCard member={member} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>
    </section>
  );
}
