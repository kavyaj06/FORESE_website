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
    'FORESE runs the mock placement drive at College of Engineering, Guindy — aptitude, group discussions and interviews with HRs from real companies, before the interviews that count.',
  actions: {
    primary: { label: 'How the drive works', to: '/mocks' },
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
  { value: '500+', label: 'Students through the drive', note: 'Across the last three years' },
  { value: '40+', label: 'Companies on the panels', note: 'HRs interviewing in person' },
  { value: '6', label: 'Stages, start to finish', note: 'Contact collection to interview' },
];

export const HOME_CONVERGE = {
  eyebrow: 'Why it exists',
  titleBefore: 'The first recruiter you face should not be the',
  accent: 'first',
  titleAfter: 'that counts.',
  description:
    'A mock drive puts the whole process — the test, the group discussion, the panel — in front of you once, with feedback, before any of it is on your record.',
} as const;

export const HOME_EVENTS = {
  eyebrow: 'Upcoming',
  title: 'What is next',
  description: 'Registration opens to eligible students shortly before each drive.',
  emptyMessage: 'Nothing scheduled right now. The next drive is announced here first.',
} as const;

export interface Announcement {
  id: string;
  date: string;
  title: string;
  body: string;
}

/** DUMMY — invented announcements. */
export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'reg-open',
    date: '2026-08-14',
    title: 'Registrations open for the 2026 drive',
    body: 'Third and fourth year students can register through the college portal until the aptitude round.',
  },
  {
    id: 'newsletter',
    date: '2026-07-28',
    title: 'August newsletter is out',
    body: 'Placement statistics, alumni interviews and the term ahead.',
  },
  {
    id: 'recruit',
    date: '2026-07-02',
    title: 'Junior member recruitment',
    body: 'Applications are open for second year students joining the team this term.',
  },
];
