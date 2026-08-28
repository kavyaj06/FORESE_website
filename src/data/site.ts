import type { SocialIconName } from '@/components/ui/SocialIcon';

/**
 * Site-wide content.
 *
 * ⚠️ PLACEHOLDER — every value marked TODO needs the real thing from the club.
 * It is deliberately obvious that these are unfilled so they cannot ship by
 * accident.
 */

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIconName;
}

export const SITE = {
  /** Wordmark. The outline writes this as "Forese". */
  name: 'Forese',

  /** TODO: confirm the official expansion of the acronym. */
  fullName: 'Forese',

  /** TODO: replace with the club's real one-line description. */
  description: 'Club description to be confirmed.',
} as const;

/** Footer "Contact Us" column. TODO: real details. */
export interface ContactDetails {
  email: string;
  phone: string;
}

// Not `as const`: these are empty placeholders today, and literal `''` types
// would narrow the footer's truthiness checks to `never`.
export const CONTACT: ContactDetails = {
  email: '',
  phone: '',
};

/**
 * Footer "Location" column. TODO: real address.
 * Kept as lines so the footer does not have to parse a single string.
 */
export const LOCATION: string[] = [];

/** TODO: replace every href with the club's real profile URLs. */
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Instagram', href: '#', icon: 'instagram' },
  { label: 'LinkedIn', href: '#', icon: 'linkedin' },
  { label: 'YouTube', href: '#', icon: 'youtube' },
];
