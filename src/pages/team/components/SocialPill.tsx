import type { ReactNode } from 'react';

/**
 * A round link to one of a person's profiles: LinkedIn, or an email address.
 *
 * Its own file now that two places draw it — the member card, and the
 * featured portrait in the membership gallery. Same control in both, so a
 * person's links look the same wherever they appear.
 *
 * An `http` link opens in a new tab, since it leaves the site; a `mailto:`
 * does not, since it opens the reader's mail app rather than a page. Either
 * way the visible content is an icon, so `label` is the link's only name for
 * a screen reader and has to say who and where.
 */
export function SocialPill({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
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
