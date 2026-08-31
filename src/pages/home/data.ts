/**
 * Home — page content.
 *
 * ⚠️ DUMMY. Every figure, company name and announcement below is invented so
 * the page can be designed against realistic text. None of it is the club's.
 * Replace before this goes anywhere public — published numbers that are not
 * true are worse than no numbers.
 */

export const HOME_HERO = {
  eyebrow: 'Forum for Economic Studies by Engineers',
  /** The word set in serif italic. Must appear in `titleAfter`'s sentence. */
  titleBefore: 'Where students meet the people who',
  accent: 'hire',
  titleAfter: 'them.',
  description:
    'FORESE runs the mock placements at Sri Venkateswara College of Engineering to connect students with HRs from leading companies through aptitude tests, group discussions and interviews — before the real ones that count.',
  actions: {
    primary: { label: 'How it works', to: '/mocks' },
    secondary: { label: 'See the gallery', to: '/gallery' },
  },
} as const;

/** DUMMY — company names are invented placeholders. */
export const RECRUITERS: string[] = [
  'Zoho',
  'Freshworks',
  'TCS',
  'Deloitte',
  'Infosys',
  'Wells Fargo',
  'Cognizant',
  'PayPal',
  'Ford',
  'Hexaware',
];

/** DUMMY — none of these figures are real. */
export const HOME_STATS = [
  { value: '500+', label: 'Students put through it', note: 'Across the last three years' },
  { value: '40+', label: 'Companies on the panels', note: 'HRs interviewing in person' },
  { value: '6', label: 'Stages, start to finish', note: 'Contact collection to interview' },
];

export const HOME_CONVERGE = {
  eyebrow: 'Why it exists',
  titleBefore: 'The first recruiter you face should not be the',
  accent: 'first',
  titleAfter: 'that counts.',
  description:
    'Mock placements put the whole process — the test, the group discussion, the panel — in front of you once, with feedback, before any of it is on your record.',
} as const;

export const HOME_EVENTS = {
  eyebrow: 'Upcoming',
  title: 'What is next',
  description: 'Conducted for every pre-final year student — no sign-up needed.',
  emptyMessage: 'Nothing scheduled right now. The next mock placements are announced here first.',
} as const;

export interface Announcement {
  id: string;
  date: string;
  title: string;
  body: string;
}

/**
 * DUMMY — invented dates and copy.
 *
 * Two kinds of entry only, deliberately: newsletter issue dates, and dates in
 * the mock placement process itself (registration windows, round dates,
 * results). Not events — an event already has its own card in Upcoming
 * Events above, so repeating it here would show the same thing twice under
 * two different names.
 */
export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'aptitude-window',
    date: '2026-09-05',
    title: 'Aptitude round opens for Mock Placements 2026',
    body: 'All pre-final year students take the aptitude round through the college portal ahead of Mock Placements on 19 September.',
  },
  {
    id: 'reg-closes',
    date: '2026-08-29',
    title: 'Registrations close for the Resume Clinic',
    body: 'Sign-ups for one-on-one CV review slots close at the end of this week.',
  },
  {
    id: 'newsletter-august',
    date: '2026-08-14',
    title: 'August newsletter is out',
    body: 'Placement statistics, alumni interviews and the term ahead.',
  },
  {
    id: 'newsletter-july',
    date: '2026-07-17',
    title: 'July newsletter is out',
    body: 'A look back at the last round of mock placements, and what changed for this one.',
  },
];
