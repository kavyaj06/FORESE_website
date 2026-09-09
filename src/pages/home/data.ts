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
  /**
   * The headline, in segments. `accent` sets one in serif italic.
   *
   * A list rather than the before/accent/after triple this used to be, which
   * allowed exactly one italic phrase in exactly one place. The line now wants
   * two of them with a roman "and" between, and the next headline will want
   * something else again — segments cost nothing and stop the shape of the
   * data deciding what the copy is allowed to say.
   */
  title: [
    { text: 'Connecting students with' },
    { text: 'industry, insight,', accent: true },
    { text: 'and' },
    { text: 'opportunity.', accent: true },
  ] as ReadonlyArray<{ text: string; accent?: boolean }>,
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
 * The events, as workflows on the canvas that replaced the pillars.
 *
 * That interaction — a number, a title, two terms, and a bar that opened into
 * four names — is gone at the club's request, and `HOME_PILLARS` with it.
 *
 * **Ids and one line each, never prose or filenames.** The name, date and
 * blurb come from `@/data/events` and the photographs from the event's own
 * gallery album, both read at render. What is written here is only what does
 * not exist anywhere else: the one-word tag on each node, and the line the
 * prompt bar types before it opens.
 *
 * `prompt` is phrased as the thing a student would ask the club for, because
 * that is what the bar it appears in looks like. It is the section's own copy,
 * not a claim about an event, so it lives here rather than in the events file.
 */
export const HOME_WORKFLOW = {
  eyebrow: 'Events',
  /** The three node labels, in the order the connectors run. */
  stages: ['Awareness', 'Exposure', 'Rehearsal'] as const,
  events: [
    { id: 'leap-2026', tag: 'Awareness', prompt: 'Show me what employers actually expect' },
    { id: 'fored-2026', tag: 'Exposure', prompt: 'Put me in front of universities and recruiters' },
    {
      id: 'mock-placement-drive-2026',
      tag: 'Rehearsal',
      prompt: 'Let me rehearse the rounds before they count',
    },
  ],
} as const;

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
