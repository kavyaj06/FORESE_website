import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { footerRoutes } from '@/app/routes';
import { CONTACT, LOCATION, LOCATION_URL, SITE, SOCIAL_LINKS } from '@/data/site';
import { DotField } from '@/components/motion/DotField';
import { ForeseMark } from './ForeseMark';

/**
 * Site footer, rebuilt on the reference the club supplied.
 *
 * Its shape, one for one: a dark dotted page, the wordmark oversized and
 * centred with the panel overlapping its lower half, a rounded card carrying a
 * lead block on the left and three short link columns on the right, a rule,
 * and a status-and-copyright row beneath it.
 *
 * Two things are ours rather than the reference's, deliberately.
 *
 * **The lead block is not a newsletter.** The reference's is an email capture
 * with a submit arrow. The club has nothing behind such a form, and a field
 * that takes an address and silently drops it is worse than no field: it is a
 * promise the site cannot keep. The same slot, the same weight on the page,
 * holds the club's own address as a `mailto:` — a control that does exactly
 * what it appears to do.
 *
 * **The bottom right is not legal links.** The reference lists Terms, Privacy
 * and Cookie Preferences; this site has no such pages, and linking to pages
 * that do not exist to match a layout is how a footer starts lying. The club's
 * full name goes there instead.
 *
 * The links come from the route table, so a new page appears here on its own,
 * and every contact row renders only when there is something real behind it.
 *
 * `data-theme="inverse"` does the flipping — every token-driven child follows
 * it and needs no dark variant of its own.
 */

const COLUMN_HEADING = 'text-caption text-text-subtle mb-5 tracking-[0.12em] uppercase';
const COLUMN_LINK =
  'text-small text-text-muted hover:text-text duration-fast ease-out-brand transition-colors';

export function Footer() {
  const quickLinks = footerRoutes('quickLinks');

  return (
    <footer data-theme="inverse" className="bg-bg relative isolate mt-auto overflow-hidden">
      <DotField />

      {/* The wordmark, behind the panel and overlapped by it — the reference
          sets its own the same way, with a soft warm wash behind the mark. */}
      <div aria-hidden="true" className="pt-3xl relative flex justify-center">
        <div className="bg-wf-glow absolute inset-x-1/4 top-1/4 h-1/2" />
        <ForeseMark className="text-border desktop:h-44 relative h-24 w-auto" />
      </div>

      <div className="px-gutter max-w-content desktop:-mt-14 relative mx-auto -mt-8 pb-10">
        <div className="bg-surface/80 desktop:p-14 rounded-xl p-8 backdrop-blur-sm">
          <div className="gap-2xl desktop:grid-cols-[1.2fr_repeat(3,minmax(0,0.6fr))] grid grid-cols-1">
            {/* The lead block. */}
            <div>
              <h2 className="text-h3">Get in touch</h2>
              <p className="text-small text-text-muted mt-sm max-w-[36ch]">
                Questions about the mock placements, or an organisation that would like to take
                part? Write to us.
              </p>

              <a
                href={`mailto:${CONTACT.email}`}
                // Width in rem, not `max-w-sm`. This repo's spacing scale
                // defines `sm` as 0.75rem and it shadows Tailwind's sizing
                // scale, so `max-w-sm` capped the field at 12px — it rendered
                // as a white blob with the address clipped out of it.
                className="bg-surface-inverse text-text-inverse gap-md mt-lg group flex w-full max-w-[24rem] items-center justify-between rounded-lg px-5 py-4"
              >
                <span className="text-small truncate">{CONTACT.email}</span>
                <ArrowRight
                  size={18}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="duration-fast ease-out-brand shrink-0 transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>

            <nav aria-label="Pages">
              <h3 className={COLUMN_HEADING}>Pages</h3>
              <ul className="space-y-3">
                {quickLinks.map((route) => (
                  <li key={route.path}>
                    <NavLink to={route.path} className={COLUMN_LINK}>
                      {route.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h3 className={COLUMN_HEADING}>Contact</h3>
              <ul className="space-y-3">
                <li>
                  <a href={`mailto:${CONTACT.email}`} className={COLUMN_LINK}>
                    {CONTACT.email}
                  </a>
                </li>
                {CONTACT.phone && (
                  <li>
                    <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className={COLUMN_LINK}>
                      {CONTACT.phone}
                    </a>
                  </li>
                )}
                {LOCATION.length > 0 && (
                  <li>
                    <a href={LOCATION_URL} target="_blank" rel="noreferrer" className={COLUMN_LINK}>
                      {LOCATION.map((address) => (
                        <span key={address} className="block">
                          {address}
                        </span>
                      ))}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {SOCIAL_LINKS.length > 0 && (
              <nav aria-label="Community">
                <h3 className={COLUMN_HEADING}>Community</h3>
                <ul className="space-y-3">
                  {SOCIAL_LINKS.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        className={COLUMN_LINK}
                      >
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>

          <hr className="border-border mt-2xl mb-lg border-t" />

          <div className="text-small text-text-muted gap-md tablet:flex-row tablet:items-center flex flex-col justify-between">
            <p className="gap-sm flex items-center">
              <span aria-hidden="true" className="bg-wf-accent size-1.5 rounded-full" />©{' '}
              {new Date().getFullYear()} {SITE.name.toUpperCase()}. All rights reserved.
            </p>
            <p>{SITE.fullName}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
