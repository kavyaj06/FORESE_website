import { Briefcase, Compass, GraduationCap, Presentation, RadioTower } from 'lucide-react';

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

/**
 * The club's real figures, with their labels exactly as supplied.
 *
 * No third line. The previous version carried a note under each label — "Across
 * the last three years", and so on — which qualified figures that no longer
 * exist. Writing new ones would mean inventing qualifiers for numbers nobody
 * has qualified, which is how an unverified claim ends up on a home page.
 */
export const HOME_STATS = [
  { value: '900+', label: 'Pre-final Year Students' },
  { value: '120+', label: 'HR Professionals & Experts' },
  { value: '100+', label: 'Prominent Companies' },
];

export const HOME_CONVERGE = {
  eyebrow: 'Why it exists',
  titleBefore: 'Shaping futures,',
  accent: 'beyond',
  titleAfter: 'the classroom.',
  description:
    'FORESE (Forum for Economic Studies by Engineers) is a student-run club that connects education with real-world opportunities. It helps students prepare for placements and higher studies through workshops, events, and practical learning. FORESE also focuses on building important skills like teamwork, communication, and problem-solving, creating a space where students can grow and move confidently towards their goals.',
} as const;

/**
 * The five pillars beneath the Why-it-exists headline.
 *
 * ⚠️ Only "Gaining soft skills" is the club's own wording — it is the one card
 * that was legible in the reference. The other four are written from the
 * paragraph above them and need checking against whatever the original five
 * actually said.
 */
export const HOME_PILLARS = [
  {
    id: 'opportunities',
    icon: Compass,
    title: 'Real opportunities',
    body: 'Connecting what is taught in class to the work that happens outside it.',
  },
  {
    id: 'placements',
    icon: Briefcase,
    title: 'Placement ready',
    body: 'Preparing students for placements before the rounds that go on record.',
  },
  {
    id: 'higher-studies',
    icon: GraduationCap,
    title: 'Higher studies',
    body: 'Guidance for students taking the research and postgraduate route.',
  },
  {
    id: 'soft-skills',
    icon: RadioTower,
    title: 'Gaining soft skills',
    body: 'Students gain soft skills like teamwork, leadership, and communication.',
  },
  {
    id: 'workshops',
    icon: Presentation,
    title: 'Workshops and events',
    body: 'Practical learning run through the year, not saved for placement season.',
  },
] as const;

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
