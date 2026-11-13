import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ClubMember } from '@/data/team';
import { TEAM_FAN } from '../data';
import { CardFan, type FanCard } from './CardFan';
import { MemberPortrait } from './MemberPortrait';

/**
 * One core rank, as two hands of cards.
 *
 * The club supplied a reference for this: a fanned stack of black cards along
 * the bottom carrying nothing but posting names, and — once one is picked —
 * that posting's people fanned above it with their photographs, names and
 * designations. Both stacks stay on screen; the postings do not go away when
 * their people arrive.
 *
 * Three things about it are deliberate and would look like oversights.
 *
 * **The posting cards hold the posting name and nothing else.** No photograph,
 * no count, no first member's face. The reference is explicit that nothing
 * about a person appears until their posting is picked, and that is also what
 * makes the two stacks read as two different kinds of thing rather than as the
 * same cards twice.
 *
 * **The stage is a fixed height and the postings move inside it.** Collapsed,
 * the stack sits in the middle of the stage; expanded, it slides to the floor
 * and the people fan into the space above. Nothing animates its own height —
 * the rule here is transform and opacity only — so the page below never jumps
 * while the stacks rearrange.
 *
 * **It is orange, not the reference's purple.** The club asked for one accent
 * across the site and chose the home page's orange for it; a second colour
 * living only on this page would read as a different site. The structure of
 * the reference is kept exactly: black card, glowing border on the one at the
 * front, white type.
 */
export function CoreFan({ members }: { members: ClubMember[] }) {
  const [openPost, setOpenPost] = useState<string | null>(null);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  /**
   * The postings in this rank, in roster order.
   *
   * A Map because insertion order is the order `members` arrives in, and that
   * is already sorted by `byRoleThenName` — so the President leads the hand
   * without this file knowing what a President is.
   */
  const posts = useMemo(() => {
    const grouped = new Map<string, ClubMember[]>();
    for (const member of members) {
      const post = member.role ?? TEAM_FAN.noPost;
      grouped.set(post, [...(grouped.get(post) ?? []), member]);
    }
    return [...grouped.entries()];
  }, [members]);

  // A rank the tabs switched to has its own postings, and whichever was open
  // before is not one of them.
  useEffect(() => {
    setOpenPost(null);
    setActiveMemberId(null);
  }, [posts]);

  const open = openPost ? posts.find(([post]) => post === openPost) : undefined;
  const people = open?.[1] ?? [];

  // Escape closes the people, the way it closes anything else that opened over
  // the page. Bound only while one is open, so it cannot swallow the key from
  // whatever else might want it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPost(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const postCards: FanCard[] = posts.map(([post, holders]) => ({
    id: post,
    label: (holders.length === 1 ? TEAM_FAN.openPostOne : TEAM_FAN.openPost)
      .replace('{post}', post)
      .replace('{count}', String(holders.length)),
    face: (
      <span className="p-md gap-sm flex h-full w-full flex-col items-center justify-center text-center">
        <span className="text-body font-semibold text-balance">{post}</span>
        {/* The mark under the front card, which is the reference's way of
            saying which one is open. Drawn on every card and scaled away on
            the rest, so it costs a transform rather than a layout change. */}
        <span
          aria-hidden="true"
          className={[
            'bg-accent duration-base ease-out-brand h-px w-8 origin-center transition-transform',
            post === openPost ? 'scale-x-100' : 'scale-x-0',
          ].join(' ')}
        />
      </span>
    ),
  }));

  const memberCards: FanCard[] = people.map((member) => ({
    id: member.id,
    label: [member.name, member.role].filter(Boolean).join(', '),
    face: (
      // The photograph is the card, not a stamp on it. A circular avatar was
      // tried and the club turned it down: at this size it reduced a person
      // to a thumbnail on a mostly empty black rectangle, where the whole
      // point of turning a posting over is to see who holds it.
      <span className="relative block h-full w-full">
        <MemberPortrait member={member} />
        {/* Dark enough at the foot to carry white type over any crop, and
            clear at the top so it never dims the face. The same treatment the
            album covers use. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
        />
        <span className="p-md absolute inset-x-0 bottom-0 flex flex-col gap-0.5 text-left">
          <span className="text-small font-semibold">{member.name}</span>
          <span className="text-caption text-text-muted">{member.role}</span>
        </span>
      </span>
    ),
  }));

  /**
   * Nobody is raised until somebody is picked.
   *
   * This used to fall back to the first person in the posting, which chose a
   * card on the reader's behalf and left the hand with one already pulled out
   * of it before they had done anything.
   */
  const activeMember = people.some((member) => member.id === activeMemberId)
    ? activeMemberId
    : null;

  return (
    <div className="gap-xl desktop:gap-2xl desktop:flex-row flex w-full flex-col items-center">
      <div className="tablet:w-44 desktop:w-56 tablet:text-right w-full shrink-0 text-center">
        <motion.div
          key={openPost ?? 'none'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="gap-xs flex flex-col"
        >
          <h3 className="text-h3 text-balance">{openPost ?? TEAM_FAN.title}</h3>
          {!open && <p className="text-small text-text-muted">{TEAM_FAN.lead}</p>}

          {open && (
            <button
              type="button"
              onClick={() => setOpenPost(null)}
              className="text-label text-text-muted hover:text-text duration-fast ease-out-brand gap-xs desktop:justify-end mt-xs inline-flex items-center justify-center transition-colors"
            >
              <X size={15} strokeWidth={2} aria-hidden="true" />
              {TEAM_FAN.close}
            </button>
          )}
        </motion.div>
      </div>

      {/* One stage of a fixed height, holding both hands.
       *
       * The people sit 24px down it rather than 110px. At 110 the raised
       * posting card rode 56px over the bottom of the hand above it, which
       * is measured, not judged by eye — and there were 231px of unused room
       * between the tab strip and the top card to spend on fixing it. The postings sit on
          its floor and rise to the middle when nothing is open; the people
          occupy the top half and are not in the document at all until a
          posting is picked, so nothing below them is reachable by Tab while
          they are away. */}
      <div className="relative min-w-0 flex-1 self-stretch" style={{ minHeight: 620 }}>
        <motion.div
          className="absolute inset-x-0 top-[24px]"
          initial={false}
          animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.94, y: open ? 0 : 24 }}
          transition={{ damping: 26, mass: 0.85, stiffness: 300, type: 'spring' }}
          style={{ pointerEvents: open ? 'auto' : 'none' }}
        >
          {open && (
            <CardFan
              // Keyed on the posting so a different one's people arrive as a
              // new hand rather than morphing out of the last: they are
              // different faces, and a diff between them slides one person's
              // photograph across the screen into another's.
              key={openPost ?? 'none'}
              cards={memberCards}
              activeId={activeMember}
              onPick={(card) => setActiveMemberId(card.id)}
              cardWidth={176}
              ratio={1.34}
              lift={0.24}
              spreadIn
            />
          )}
        </motion.div>

        <motion.div
          className="absolute inset-x-0 bottom-0"
          initial={false}
          animate={{ y: open ? 0 : -170 }}
          transition={{ damping: 26, mass: 0.85, stiffness: 300, type: 'spring' }}
        >
          <CardFan
            cards={postCards}
            activeId={openPost}
            onPick={(card) => {
              // Picking the open posting again closes it, which is the
              // shortest way back and the one a reader tries first.
              setOpenPost((current) => (current === card.id ? null : card.id));
              setActiveMemberId(null);
            }}
            cardWidth={190}
            ratio={1.2}
            lift={0.24}
            step={11}
          />
        </motion.div>
      </div>

      <div className="tablet:w-44 desktop:w-56 tablet:text-left w-full shrink-0 text-center">
        <p className="text-caption text-text-subtle">{TEAM_FAN.hint}</p>
        {/* The announcement, for anyone who cannot see the hand rearrange.
            Out of sight rather than on the page: spelled out visibly it was a
            list of six names repeating what the cards already say. */}
        <p aria-live="polite" className="sr-only">
          {open ? `${openPost}: ${people.map((member) => member.name).join(', ')}` : ''}
        </p>
      </div>
    </div>
  );
}
