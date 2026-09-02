import { useState } from 'react';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { ClubMember } from '@/data/team';
import { cn } from '@/lib/cn';
import { MemberPortrait } from './MemberPortrait';

interface MemberCardProps {
  member: ClubMember;
  /** `lead` is the taller senior-core treatment. */
  size?: 'lead' | 'standard';
}

/**
 * One person, in one card: portrait, name, position, their line — and their
 * links on hover.
 *
 * On hover the whole card takes the theme colour, exactly as the reference
 * does in green. Ours is black, so the card fills black and its text flips to
 * white: the hovered person is lifted out of the grid and everyone around them
 * recedes. That single fill is doing what a coloured brand would do elsewhere.
 *
 * The portrait sits inset inside the card rather than bleeding to its edge.
 * That inset is what makes the fill read as a frame around the person instead
 * of the card simply changing colour behind them.
 *
 * Portraits are greyscale at rest and full colour on hover — a hundred
 * photographs taken by different people in different light look like a jumble
 * in colour, and greyscale is what makes the grid read as one deliberate set.
 *
 * The links are real anchors, in the DOM at all times and revealed by opacity,
 * so keyboard users reach them and screen readers read them even though
 * sighted users only see them on hover. Focus reveals the strip too, since
 * keyboard users never fire a group hover.
 *
 * On a touch screen there is no hover, so the whole card is a button that
 * opens the same reveal on tap — links, quote, fill and all. It is rendered
 * only where `(hover: none)` matches, rather than always present and hidden by
 * CSS: a full-card button sitting invisibly over every card on desktop would
 * swallow text selection and put a second tab stop on all ninety of them.
 *
 * Tapping is also why the link strip carries `pointer-events-none` until it is
 * shown. Invisible at `opacity: 0`, it still occupies the photograph's
 * top-right corner, so without that a tap there would hit a link the reader
 * cannot see instead of opening the card.
 *
 * Core members' quotes surface a different way from everyone else's. Senior
 * and junior core get their line as a reveal over the photograph itself —
 * scrim fading up, quote rising into it — rather than as permanent text in the
 * card footer. The distinction is tied to `member.rank`, not to which section
 * is rendering the card, so a core member reads the same way wherever their
 * card appears. General members keep the plain, always-visible footer quote:
 * with ninety of them the reveal would mean most quotes are never seen at all,
 * since nobody opens ninety cards.
 *
 * That reveal is gated on the card's own width with a container query, not on
 * the viewport, because what it needs is room on the photograph and the same
 * viewport gives a card three different widths here — a senior card is 254px
 * at 1440 where a general card in the same section is 199px. Under 12rem the
 * quote and the link pills both end up claiming one ~160px square and the text
 * runs under the pills, so a card that narrow falls back to the footer quote
 * instead. Measured across 390 to 2400: zero overlap at every width.
 */
export function MemberCard({ member, size = 'standard' }: MemberCardProps) {
  const isCore = member.rank !== 'member';
  const isTouch = useMediaQuery('(hover: none)');
  const [open, setOpen] = useState(false);

  return (
    <article
      data-open={open || undefined}
      className={cn(
        'group border-border bg-surface-raised @container relative flex h-full flex-col rounded-lg border p-2',
        // 400ms on an even curve: the fill should be seen happening. Movement
        // and colour together are what make the hovered card feel picked up
        // rather than simply repainted.
        'ease-smooth transition-[background-color,border-color,box-shadow,translate] duration-[400ms]',
        'hover:border-accent hover:bg-accent hover:-translate-y-1.5 hover:shadow-lg',
        'focus-within:border-accent focus-within:bg-accent focus-within:-translate-y-1.5',
        'data-open:border-accent data-open:bg-accent data-open:-translate-y-1.5 data-open:shadow-lg',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-md',
          size === 'lead' ? 'aspect-[4/5]' : 'aspect-square',
        )}
      >
        <div className="duration-slow ease-out-brand h-full w-full grayscale transition-[transform,filter] group-focus-within:grayscale-0 group-hover:scale-[1.04] group-hover:grayscale-0 group-data-open:scale-[1.04] group-data-open:grayscale-0">
          <MemberPortrait member={member} />
        </div>

        {/* Pill in the photograph's top-right corner. It used to sit centred
            on the right edge, which put it directly across the middle of a
            core member's quote as that quote rose into the same frame — two
            things arriving on the same hover, overlapping. The corner is the
            one part of the photograph nothing else claims: the scrim and the
            quote both work from the bottom up. */}
        <ul
          className={cn(
            'bg-accent-fg absolute top-2 right-2 z-10 flex flex-col gap-1.5 rounded-xl p-1.5 shadow-md',
            'duration-base ease-out-brand pointer-events-none translate-x-3 opacity-0 transition-[opacity,transform]',
            'group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100',
            'group-focus-within:pointer-events-auto group-focus-within:translate-x-0 group-focus-within:opacity-100',
            'group-data-open:pointer-events-auto group-data-open:translate-x-0 group-data-open:opacity-100',
          )}
        >
          {member.linkedin && (
            <SocialPill href={member.linkedin} label={`${member.name} on LinkedIn`}>
              <SocialIcon name="linkedin" size={15} />
            </SocialPill>
          )}
          {member.email && (
            <SocialPill href={`mailto:${member.email}`} label={`Email ${member.name}`}>
              <SocialIcon name="mail" size={15} />
            </SocialPill>
          )}
        </ul>

        {isCore && member.quote && (
          <>
            {/* Scrim first, quote on top — the same layering PhotoTile and
                AlbumCard already use elsewhere on the site, so a hovered
                photograph reads the same way everywhere it appears. Literal
                black: it is darkening a photograph, and has to stay dark
                whatever the surrounding theme is doing. */}
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent',
                'hidden @[12rem]:block',
                'duration-base ease-out-brand opacity-0 transition-opacity',
                'group-focus-within:opacity-100 group-hover:opacity-100 group-data-open:opacity-100',
              )}
            />
            <p
              className={cn(
                'tablet:p-4 pointer-events-none absolute inset-x-0 bottom-0 p-3 text-white italic',
                'hidden @[12rem]:block',
                size === 'lead' ? 'text-body' : 'text-small',
                'duration-base ease-out-brand translate-y-2 opacity-0 transition-[opacity,transform]',
                'group-hover:translate-y-0 group-hover:opacity-100',
                'group-focus-within:translate-y-0 group-focus-within:opacity-100',
                'group-data-open:translate-y-0 group-data-open:opacity-100',
              )}
            >
              “{member.quote}”
            </p>
          </>
        )}
      </div>

      <div className="pt-md flex flex-1 flex-col gap-0.5 px-1.5 pb-1">
        <h3
          className={cn(
            'ease-smooth group-hover:text-accent-fg group-focus-within:text-accent-fg group-data-open:text-accent-fg transition-colors duration-[400ms]',
            size === 'lead' ? 'text-h3' : 'text-body font-semibold',
          )}
        >
          {member.name}
        </h3>

        {/* Only a real title. This used to fall back to the member's tech team
            and then to the word "Member", so a general member's card read
            "Design" — labelling them with something that is a property of the
            grid they are in, not a position they hold. `member.team` is still
            what the filter above the grid runs on; it is just not shown here.
            No fallback either: a card with nothing under the name is honest,
            where a card that says "Member" adds a line to say nothing. */}
        {member.role && (
          <p className="text-small text-text-muted ease-smooth group-hover:text-accent-fg/75 group-focus-within:text-accent-fg/75 group-data-open:text-accent-fg/75 transition-colors duration-[400ms]">
            {member.role}
          </p>
        )}

        {member.quote && (
          <p
            className={cn(
              'text-caption text-text-muted border-border mt-sm ease-smooth group-hover:border-accent-fg/25 group-hover:text-accent-fg/80 group-focus-within:text-accent-fg/80 group-data-open:border-accent-fg/25 group-data-open:text-accent-fg/80 border-l pl-3 italic transition-colors duration-[400ms]',
              // A core member's quote belongs over their photograph — but only
              // where the photograph can hold it. Below a 14rem card the quote
              // and the link pills are both claiming the same ~160px square, and
              // the text ran straight under the pills. So the narrow card falls
              // back to the footer quote every general member already uses, and
              // its photograph carries the links alone.
              isCore && '@[12rem]:hidden',
            )}
          >
            “{member.quote}”
          </p>
        )}
      </div>

      {isTouch && (
        <button
          type="button"
          aria-expanded={open}
          aria-label={`${open ? 'Hide' : 'Show'} links for ${member.name}`}
          onClick={(event) => {
            // A tap leaves focus on the button, and `focus-within` then holds
            // the card open regardless of state — so the tap that should close
            // it appeared to do nothing. Only pointer activation drops focus;
            // keyboard activation reports `detail: 0` and keeps it, because
            // there the focus ring is how you know where you are.
            if (event.detail > 0) event.currentTarget.blur();
            setOpen((current) => !current);
          }}
          className="absolute inset-0 rounded-lg"
        />
      )}
    </article>
  );
}

function SocialPill({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith('http');

  return (
    <li>
      <a
        href={href}
        aria-label={label}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="bg-accent text-accent-fg hover:bg-primary-hover duration-fast rounded-pill flex size-8 items-center justify-center transition-colors"
      >
        {children}
      </a>
    </li>
  );
}
