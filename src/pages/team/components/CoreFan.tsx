import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { ClubMember } from '@/data/team';
import { TEAM_FAN } from '../data';
import { CardFan, type FanCard } from './CardFan';
import { MemberPortrait } from './MemberPortrait';

/**
 * One rank, as a hand of cards.
 *
 * The club asked for the cards to carry posts — President, Vice President,
 * General Secretary — and for clicking one to bring that post's people out
 * and spread them. That is what this does, with one rule the roster forced.
 *
 * **A post fan needs at least one post holding more than one person.**
 * Otherwise the posts and the people are the same list, and the second level
 * is a spread of exactly one card every time: the Leads are three posts of one
 * person each, and so are the Senior Executives. Those ranks fan the people
 * directly, with the post printed under the name. The senior core (1, 2, 6)
 * and the junior core (6, 2, 1, 1) get both levels.
 *
 * The rule is derived rather than a list of rank names, so a rank that gains a
 * second treasurer starts showing posts on its own. `TeamBrowser` already
 * carries the same judgement in a different form: `roleRows` groups the senior
 * core by role and deliberately does not do it to the junior core, because
 * rows of one card "read as a mistake rather than as a hierarchy".
 */
export function CoreFan({ members }: { members: ClubMember[] }) {
  const [openPost, setOpenPost] = useState<string | null>(null);
  // Which post to raise when the hand of posts comes back, so returning does
  // not dump the reader at the President every time.
  const [lastPost, setLastPost] = useState<string | null>(null);

  /**
   * The posts in this rank, in roster order.
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

  const showsPosts = posts.some(([, people]) => people.length > 1);
  const open = openPost ? posts.find(([post]) => post === openPost) : undefined;

  // Escape goes back up, the way it closes anything else that opened over the
  // page. Bound only while a post is open, so it cannot swallow the key from
  // whatever else might want it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPost(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const face = (member: ClubMember) => (
    <MemberPortrait member={member} className="duration-base ease-out-brand transition-transform" />
  );

  const peopleCards = (people: ClubMember[]): FanCard[] =>
    people.map((member) => ({
      id: member.id,
      title: member.name,
      meta: [member.role, member.batch].filter(Boolean).join(' · '),
      face: face(member),
    }));

  if (!showsPosts) {
    return <CardFan cards={peopleCards(members)} />;
  }

  if (open) {
    const [post, people] = open;
    return (
      <CardFan
        // Keyed on the post so the hand arrives rather than morphing out of
        // the previous one: the two sets are different people, and a diff
        // between them slides faces across the screen into each other.
        key={post}
        cards={peopleCards(people)}
        aside={
          <button
            type="button"
            onClick={() => setOpenPost(null)}
            className="text-label text-text-muted hover:text-text duration-fast ease-out-brand gap-xs tablet:justify-start inline-flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
            {TEAM_FAN.back}
          </button>
        }
      />
    );
  }

  const postCards: FanCard[] = posts.map(([post, people]) => ({
    id: post,
    title: post,
    label: (people.length === 1 ? TEAM_FAN.openPostOne : TEAM_FAN.openPost)
      .replace('{post}', post)
      .replace('{count}', String(people.length)),
    meta:
      people.length === 1
        ? people[0].name
        : TEAM_FAN.holders.replace('{count}', String(people.length)),
    // The first person in the post, which is the first in roster order rather
    // than a pick: the card is a door into the post, not a portrait of them.
    face: face(people[0]),
  }));

  return (
    <CardFan
      key="posts"
      cards={postCards}
      defaultActiveId={lastPost ?? undefined}
      onOpen={(card) => {
        setOpenPost(card.id);
        setLastPost(card.id);
      }}
      aside={<p className="text-caption text-text-subtle">{TEAM_FAN.hint}</p>}
    />
  );
}
