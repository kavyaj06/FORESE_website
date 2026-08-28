import { NavLink } from 'react-router-dom';
import { footerRoutes } from '@/app/routes';
import { CONTACT, LOCATION, SITE, SOCIAL_LINKS } from '@/data/site';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Container } from './Container';

/**
 * Site footer.
 *
 * Four columns, matching the outline: brand, Quick links, Contact Us,
 * Location. The Quick links column is derived from the route table, so a new
 * page appears here automatically once it declares a footer group.
 *
 * Columns whose content has not been supplied yet render a visible
 * "to be added" note rather than collapsing silently — an empty column that
 * looks intentional is how placeholder content survives to production.
 */

const COLUMN_HEADING = 'text-eyebrow text-text-subtle uppercase';
const COLUMN_LINK = 'text-small text-text-muted hover:text-text transition-colors duration-fast';

function Pending({ what }: { what: string }) {
  return <p className="text-small text-text-subtle italic">{what} to be added</p>;
}

export function Footer() {
  const quickLinks = footerRoutes('quickLinks');

  return (
    <footer className="border-border bg-surface mt-auto border-t">
      <Container className="py-section">
        <div className="grid gap-xl tablet:grid-cols-2 desktop:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-sm">
            <p className="text-h3">{SITE.name}</p>
            <p className="text-small text-text-muted">{SITE.description}</p>

            {SOCIAL_LINKS.length > 0 && (
              <ul className="mt-xs flex items-center gap-xs">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="text-text-muted hover:text-text hover:bg-surface-raised flex size-11 items-center justify-center rounded-md transition-colors duration-fast"
                    >
                      <SocialIcon name={social.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links" className="flex flex-col gap-sm">
            <h2 className={COLUMN_HEADING}>Quick links</h2>
            <ul className="flex flex-col gap-xs">
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
          <div className="flex flex-col gap-sm">
            <h2 className={COLUMN_HEADING}>Contact Us</h2>
            {CONTACT.email || CONTACT.phone ? (
              <ul className="flex flex-col gap-xs">
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
          <div className="flex flex-col gap-sm">
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

        <p className="text-caption text-text-subtle border-border mt-2xl border-t pt-lg">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
