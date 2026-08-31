import type { SocialIconName } from '@/components/ui/SocialIcon';

/**
 * Site-wide content.
 *
 * ============================================================================
 * Most of this is now the club's own wording. Two things are still NOT:
 *
 *   • CONTACT.phone    — supplied as "+91 XXXXX XXXXX", i.e. deliberately
 *                        blank. The footer renders the phone row only when
 *                        this holds digits, so it is hidden rather than
 *                        published as a row of X's. Fill it in and the row
 *                        comes back on its own.
 *   • SOCIAL_LINKS     — the hrefs are guesses at profile URLs, not verified.
 *                        These are the one kind of placeholder that fails
 *                        silently: a wrong link looks exactly like a right one
 *                        until somebody clicks it.
 *
 * The logo is NOT a placeholder — it is the club's real artwork, traced to
 * `src/components/layout/ForeseMark.tsx` (and `public/forese-logo.svg`).
 * ==========================================================================*/

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIconName;
}

export const SITE = {
  /** Wordmark. The outline writes this as "Forese". */
  name: 'Forese',

  fullName: 'Forum for Economic Studies by Engineers',

  description:
    'The placement and industry-interaction forum of Sri Venkateswara College of Engineering, connecting students with industry, opportunities, and experiences.',

  /**
   * `name` is still used for the document title, the accessible name on the
   * logo link, and the footer's copyright line. The visible wordmark comes
   * from the logo artwork itself, not from this string.
   */
} as const;

export interface ContactDetails {
  email: string;
  phone: string;
}

/**
 * `phone` is intentionally empty rather than a masked placeholder. The number
 * supplied was "+91 XXXXX XXXXX", which is a way of saying "not yet" — and a
 * footer that prints X's where a phone number goes looks like a bug, not like
 * a pending detail. The footer hides the row until there is something to dial.
 */
export const CONTACT: ContactDetails = {
  email: 'forese@svce.ac.in',
  phone: '',
};

/**
 * Footer "Visit us" column. Kept as lines so the footer does not have to parse
 * a single string, and so the break points stay a content decision.
 */
/**
 * Maps link for the "Visit us" column, as supplied.
 *
 * A `share.google` short link is an opaque redirect: it resolves to a place on
 * Google Maps, but nothing here can tell what it points at, and it depends on
 * that shortener continuing to exist. It works, and it is what the club gave
 * us — but the long-lived form is the maps.google.com URL it expands to, and
 * swapping this for that is a one-line change worth making when convenient.
 */
export const LOCATION_URL = 'https://share.google/SOHhRjuw8Jdk73uol';

export const LOCATION: string[] = [
  'Sri Venkateswara College of Engineering',
  'Pennalur, Sriperumbudur',
  'Chennai – Bengaluru Highway',
  'Tamil Nadu – 602117, India',
];

/**
 * LinkedIn and GitHub are the club's real profiles.
 *
 * ⚠️ Instagram is still a guess. It is the one link here nobody has confirmed,
 * and a wrong social URL fails silently — it looks exactly like a right one
 * until somebody clicks it.
 *
 * The LinkedIn URL is trimmed to the company page itself. What was supplied
 * ended in `/posts/?feedView=all`, which is the state of whoever copied it
 * rather than part of the address; it lands on the same page, but deep-links
 * past the profile and carries a query string that LinkedIn is free to stop
 * honouring.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Instagram', href: 'https://instagram.com/forese_svce', icon: 'instagram' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/forese/', icon: 'linkedin' },
  { label: 'GitHub', href: 'https://github.com/ForeseTech', icon: 'github' },
];
