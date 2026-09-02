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
    'FORESE runs the mock placements at Sri Venkateswara College of Engineering to connect students with HRs from leading companies through aptitude tests, group discussions and interviews, before the real ones that count.',
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

/**
 * The one panel of things coming up — mock placement stages and events
 * together. The dates themselves live in `@/data/mockSchedule` and
 * `@/data/events`, never here: both are read by more than one page, and two
 * copies of a date drift apart the first time one of them is corrected.
 */
export const HOME_EVENTS = {
  eyebrow: 'Upcoming',
  title: 'What is next',
  description: 'Mock placement rounds and club events, in the order they happen.',
  emptyMessage: 'Nothing scheduled right now. The next mock placements are announced here first.',
} as const;
