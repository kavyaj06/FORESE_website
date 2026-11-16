import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ClubMember } from '@/data/team';
import { TEAM_FAN } from '../data';
import { CardDeal, DEAL_GAP, DEAL_RATIO } from './CardDeal';
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
/** At this stage width and above, the deck and the people sit side by side. */
const WIDE = 900;
/** The deck's share of a wide stage; the people get the rest. */
const DECK_SHARE = 0.38;
/** Between the deck and the people on a wide stage, or above the people when stacked. */
const ZONE_GAP = 32;
/** The posting cards, as `CardFan` is given them. */
const DECK_CARD = 190;
const DECK_RATIO = 1.2;
const DECK_LIFT = 0.24;
/** The people's cards: at most this wide, at most three to a row. */
const PERSON_MAX = 200;
const PERSON_COLUMNS = 3;
/** Headroom for a raised or hovered card, so it never clips the stage. */
const RAISE_ROOM = 16;
const spring = { damping: 26, mass: 0.85, stiffness: 300, type: 'spring' as const };

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

  const largestPost = Math.max(1, ...posts.map(([, holders]) => holders.length));

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
        {/* The shade belongs to the name block, not to the card: it is
            exactly as tall as the name's lines plus a short fade above them.
            A band sized as a share of the card was either too much on the big
            laptop cards or too little where the small tablet and phone cards
            wrap a name onto two lines. */}
        <span className="p-sm pt-lg absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/85 via-black/65 via-55% to-transparent text-left">
          {/* The name, and nothing under it. Every card in a hand holds the
              same posting and the heading beside the fan already says which
              one, so printing it six times said nothing and crowded the
              photograph it was sitting on. It stays in the button's
              accessible name, which is read one card at a time. */}
          <span className="text-caption leading-tight font-semibold">{member.name}</span>
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

  /**
   * The stage, measured. The deck and the people's grid are sized together:
   * where the deck goes decides how much room the people get.
   */
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState<number | null>(null);
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => {
    if (stageWidth === null) return null;
    const W = stageWidth;
    const wide = W >= WIDE;

    // The deck: the same fit `CardFan` applies to itself, so the numbers here
    // are the size it will actually draw.
    const deckWidth = wide ? Math.round(W * DECK_SHARE) : W;
    const deckCard = Math.min(DECK_CARD, deckWidth / (1.45 + posts.length * 0.16));
    const deckCardHeight = deckCard * DECK_RATIO;
    const lift = deckCardHeight * DECK_LIFT;
    // The raised card above, the arc's droop below.
    const deckBlock = deckCardHeight + lift + 24;

    // The people: sized for the rank's biggest posting, so every posting's
    // cards are the same size, and the stage is one fixed height per rank —
    // nothing below the section moves when a different posting opens.
    const peopleWidth = wide ? W - deckWidth - ZONE_GAP : W;
    const columns = Math.min(largestPost, PERSON_COLUMNS);
    const cardWidth = Math.min(PERSON_MAX, (peopleWidth - (columns - 1) * DEAL_GAP) / columns);
    const rows = Math.ceil(largestPost / columns);
    const gridHeight = rows * cardWidth * DEAL_RATIO + (rows - 1) * DEAL_GAP + RAISE_ROOM * 2;

    if (wide) {
      const height = Math.max(gridHeight, deckBlock) + RAISE_ROOM;
      const deckTop = (height - deckBlock) / 2 + lift;
      const grid = { left: deckWidth + ZONE_GAP, top: (height - gridHeight) / 2 };
      return {
        wide,
        height,
        deck: { top: deckTop, width: deckWidth, closedX: (W - deckWidth) / 2, closedY: 0 },
        grid: { ...grid, width: peopleWidth, height: gridHeight },
        origin: { x: deckWidth / 2 - grid.left, y: deckTop + deckCardHeight / 2 - grid.top },
        cardWidth,
        columns,
      };
    }

    // Stacked: the deck on top, the people under it. Closed, the deck sits
    // in the middle of the stage rather than above a blank grid.
    const height = deckBlock + ZONE_GAP + gridHeight;
    const deckTop = lift;
    const grid = { left: 0, top: deckBlock + ZONE_GAP };
    return {
      wide,
      height,
      deck: { top: deckTop, width: W, closedX: 0, closedY: (height - deckBlock) / 2 },
      grid: { ...grid, width: W, height: gridHeight },
      origin: { x: W / 2, y: deckTop + deckCardHeight / 2 - grid.top },
      cardWidth,
      columns,
    };
  }, [stageWidth, posts.length, largestPost]);

  return (
    <div className="w-full">
      {/* One stage, one fixed height per rank. The posting deck sits in the
          middle until a posting is picked, then moves aside — to the left on
          wide screens, to the top on narrow ones — and that posting's people
          are dealt out of it into the space beside or below. The people are
          not in the document until a posting is picked, so nothing there is
          reachable by Tab while they are away. */}
      <div ref={stageRef} className="relative w-full" style={{ height: layout?.height ?? 560 }}>
        {layout && (
          <>
            <motion.div
              className="absolute left-0"
              style={{ top: layout.deck.top, width: layout.deck.width }}
              initial={false}
              animate={{
                x: open ? 0 : layout.deck.closedX,
                y: open ? 0 : layout.deck.closedY,
                scale: open || !layout.wide ? 1 : 1.08,
              }}
              transition={spring}
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
                cardWidth={DECK_CARD}
                ratio={DECK_RATIO}
                lift={DECK_LIFT}
                step={11}
              />
            </motion.div>

            {open && (
              <div className="absolute" style={{ left: layout.grid.left, top: layout.grid.top }}>
                <CardDeal
                  // Keyed on the posting so a different one's people are
                  // dealt fresh from the deck rather than sliding out of the
                  // last posting's places.
                  key={openPost ?? 'none'}
                  cards={memberCards}
                  activeId={activeMember}
                  onPick={(card) => setActiveMemberId(card.id)}
                  cardWidth={layout.cardWidth}
                  columns={layout.columns}
                  width={layout.grid.width}
                  height={layout.grid.height}
                  origin={layout.origin}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* The announcement, for anyone who cannot see the cards being dealt.
          There is no visible heading beside the cards any more — the club
          asked for the cards alone — so this is the only place the open
          posting and its people are named outside the cards themselves. */}
      <p aria-live="polite" className="sr-only">
        {open ? `${openPost}: ${people.map((member) => member.name).join(', ')}` : ''}
      </p>
    </div>
  );
}
