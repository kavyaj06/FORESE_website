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
 * ⚠️ The titles and the `terms` are the club's own, given as a set. The `body`
 * sentences beneath them are still written-from-the-paragraph and need
 * checking — they are no longer shown on screen, but they are what assistive
 * technology and the reduced-motion list read, so they are not decoration.
 *
 * ⚠️ "Soft skills" was "Gaining soft skills", which was the one title carried
 * over verbatim from the club's own reference. The shorter form is what the
 * club asked for; the longer phrasing survives inside its `body`.
 *
 * `terms` are the three or four words shown under each title. Stored as an
 * array rather than a pre-joined string, because the separator between them
 * is typography, not content — the component joins them.
 */
export const HOME_PILLARS = [
  {
    id: 'opportunities',
    title: 'Real opportunities',
    terms: ['Internships', 'Projects', 'Exposure'],
    body: 'Connecting what is taught in class to the work that happens outside it.',
  },
  {
    id: 'placements',
    title: 'Placement ready',
    terms: ['Training', 'Mock interviews'],
    body: 'Preparing students for placements before the rounds that go on record.',
  },
  {
    id: 'higher-studies',
    title: 'Higher studies',
    terms: ['Guidance', 'Pathways'],
    body: 'Guidance for students taking the research and postgraduate route.',
  },
  {
    id: 'soft-skills',
    title: 'Soft skills',
    terms: ['Teamwork', 'Leadership'],
    body: 'Students gain soft skills like teamwork, leadership, and communication.',
  },
  {
    id: 'workshops',
    title: 'Workshops & events',
    terms: ['Learn', 'Build', 'Participate'],
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
