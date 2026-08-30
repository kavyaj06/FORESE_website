import { NavLink } from 'react-router-dom';
import { footerRoutes } from '@/app/routes';
import { CONTACT, LOCATION, SITE, SOCIAL_LINKS } from '@/data/site';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Container } from './Container';
import { Logo } from './Logo';
import { HoverWordmark } from '@/components/motion/HoverWordmark';

/**
 * Site footer.
 *
 * Four columns, matching the outline: brand, Quick links, Contact Us,
 * Location. The Quick links column is derived from the route table, so a new
 * page appears here automatically once it declares a footer group.
 *
 * The brand column is given twice the width of the link columns. Equal
 * quarters look tidy in a wireframe and wrong in practice — a paragraph and a
 * four-item list do not want the same measure.
 *
 * Columns whose content is missing still render a visible "to be added" note
 * rather than collapsing silently. An empty column that looks intentional is
 * exactly how placeholder content survives to production.
 *
 * The whole footer runs on `data-theme="inverse"`, not just the wordmark band
 * at its foot — the same mechanism the hero, the stat band and the drive
 * callout already use, so nothing here needed a dark variant written by hand.
 * Every class below is a semantic token (`bg-surface`, `text-text-muted`,
 * `border-border`…) and simply resolves to its dark value for the whole
 * section once the attribute is set on the root element.
 */

const COLUMN_HEADING = 'text-eyebrow text-text-subtle uppercase';

/** Links shift on hover rather than changing colour: in a monochrome palette
    there is no second colour to move to, so movement carries the feedback. */
const COLUMN_LINK =
  'text-small text-text-muted hover:text-text duration-fast ease-out-brand inline-block transition-[color,transform] hover:translate-x-0.5';

function Pending({ what }: { what: string }) {
  return <p className="text-small text-text-subtle italic">{what} to be added</p>;
}

export function Footer() {
  const quickLinks = footerRoutes('quickLinks');

  return (
    <footer
      data-theme="inverse"
      className="border-border bg-bg relative isolate mt-auto overflow-hidden border-t"
    >
      <div aria-hidden="true" className="bg-radial-glow pointer-events-none absolute inset-0" />

      <Container className="py-section relative">
        <div className="gap-xl tablet:grid-cols-2 desktop:grid-cols-12 grid">
          {/* Brand */}
          <div className="gap-md desktop:col-span-5 flex flex-col">
            <Logo />
            <p className="text-small text-text-muted">{SITE.description}</p>

            {SOCIAL_LINKS.length > 0 && (
              <ul className="mt-xs gap-xs flex items-center">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="text-text-muted hover:text-text hover:border-border-strong hover:bg-surface-raised border-border duration-base ease-out-brand flex size-11 items-center justify-center rounded-lg border transition-colors"
                    >
                      <SocialIcon name={social.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links" className="gap-sm desktop:col-span-2 flex flex-col">
            <h2 className={COLUMN_HEADING}>Quick links</h2>
            <ul className="gap-xs flex flex-col">
              {quickLinks.map((route) => (
                <li key={route.path}>
                  <NavLink to={route.path} className={COLUMN_LINK}>
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Us */}
          <div className="gap-sm desktop:col-span-2 flex flex-col">
            <h2 className={COLUMN_HEADING}>Contact Us</h2>
            {CONTACT.email || CONTACT.phone ? (
              <ul className="gap-xs flex flex-col">
                {CONTACT.email && (
                  <li>
                    <a href={`mailto:${CONTACT.email}`} className={COLUMN_LINK}>
                      {CONTACT.email}
                    </a>
                  </li>
                )}
                {CONTACT.phone && (
                  <li>
                    <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className={COLUMN_LINK}>
                      {CONTACT.phone}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <Pending what="Contact details" />
            )}
          </div>

          {/* Location */}
          <div className="gap-sm desktop:col-span-3 flex flex-col">
            <h2 className={COLUMN_HEADING}>Location</h2>
            {LOCATION.length > 0 ? (
              <address className="text-small text-text-muted not-italic">
                {LOCATION.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            ) : (
              <Pending what="Address" />
            )}
          </div>
        </div>

        <div className="border-border mt-2xl pt-lg gap-sm flex flex-wrap items-center justify-between border-t">
          <p className="text-caption text-text-subtle">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="text-caption text-text-subtle">{SITE.fullName}</p>
        </div>
      </Container>

      {/* The wordmark echo. Desktop only — it needs real width to read, and a
          cursor to reveal it; a phone has neither. Decorative, hence outside
          the Container's max-width so it can run the full bleed of the band.
          No theme wrapper needed here any more — it inherits the footer's own
          inverse context. */}
      <div className="desktop:block relative hidden">
        <HoverWordmark text={SITE.name} className="h-56 w-full" />
      </div>
    </footer>
  );
}
