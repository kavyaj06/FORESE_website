import type { SocialIconName } from '@/components/ui/SocialIcon';

/**
 * Site-wide content.
 *
 * ============================================================================
 * ⚠️  EVERY VALUE BELOW IS DUMMY CONTENT.
 * ----------------------------------------------------------------------------
 * It exists so the header and footer can be designed and reviewed against
 * realistic text rather than empty columns. None of it has been confirmed with
 * the club. Before this site goes anywhere public, replace:
 *
 *   • SITE.fullName, SITE.description   — the club's own wording
 *   • CONTACT.email, CONTACT.phone      — real, monitored addresses
 *   • LOCATION                          — the real address
 *   • SOCIAL_LINKS hrefs                — real profile URLs
 *
 * The logo is NOT a placeholder — it is the club's real artwork, traced to
 * `src/components/layout/ForeseMark.tsx` (and `public/forese-logo.svg`).
 *
 * The phone number is the standard Indian placeholder and the profile URLs are
 * guesses. Shipping them would publish contact details that do not work.
 * ==========================================================================*/

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIconName;
}

export const SITE = {
  /** Wordmark. The outline writes this as "Forese". */
  name: 'Forese',

  /** DUMMY — the expansion is unconfirmed. */
  fullName: 'Forum for Economic Studies by Engineers',

  /** DUMMY — needs the club's own description. */
  description:
    'The placement and industry-interaction forum of College of Engineering, Guindy — running mock placements, corporate sessions and the student newsletter.',

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

/** DUMMY — not real, monitored contact details. */
export const CONTACT: ContactDetails = {
  email: 'contact@forese.in',
  phone: '+91 98765 43210',
};

/**
 * Footer "Location" column. DUMMY — unconfirmed address.
 * Kept as lines so the footer does not have to parse a single string.
 */
export const LOCATION: string[] = [
  'College of Engineering, Guindy',
  'Anna University, Sardar Patel Road',
  'Chennai 600025, Tamil Nadu',
];

/** DUMMY — every href is a guess, not a verified profile. */
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Instagram', href: 'https://instagram.com/forese_ceg', icon: 'instagram' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/forese-ceg', icon: 'linkedin' },
  { label: 'YouTube', href: 'https://youtube.com/@forese', icon: 'youtube' },
];
