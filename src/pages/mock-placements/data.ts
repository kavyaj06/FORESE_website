import {
  Briefcase,
  ClipboardCheck,
  Contact,
  MessagesSquare,
  PencilRuler,
  PhoneCall,
  type LucideIcon,
} from 'lucide-react';

/**
 * Mock Placement — page content.
 *
 * Everything the page says lives here. Sections take this as props and hold no
 * copy of their own, so updating the process next year means editing this file
 * and nothing else.
 */

export const MOCK_PLACEMENTS_INTRO = {
  eyebrow: 'How it works',
  title: 'From first call to final interview',
  description:
    'Mock placements run in six stages. The first two are the work the team does before any student sits down: finding the professionals who will sit on the panels. The rest is the process students go through.',
} as const;

/**
 * The "what this actually is" block, above the timeline.
 *
 * Unlike most of this site's copy, this is the club's own real text, carried
 * over from the existing FORESE site rather than invented — including the 130+
 * figure, which is therefore a number that can be published.
 *
 * Split into paragraphs rather than kept as one block because it is read
 * word-by-word as the reader scrolls: the breaks are where the sweep pauses,
 * so they have to fall on real shifts in the argument (what it is → what
 * happened in 2025 → what it has become).
 */
export const MOCK_PLACEMENTS_ABOUT = {
  eyebrow: 'What it is',
  title: 'Bridging talent with opportunity',
  paragraphs: [
    "FORESE's Mock Placements is the flagship annual initiative of Sri Venkateswara College of Engineering, built to prepare pre-final year students from every discipline for the challenges of their placement journey. Run in both online and offline modes, it is a full simulation of the recruitment process: aptitude tests, group discussions and personal interviews, giving students an authentic taste of real placement dynamics in a competitive but supportive environment.",
    'In 2025 the programme reached new heights, with over 130 HR professionals and industry experts taking part. They did not only assess students. They mentored them, with insights and personal feedback that sharpened their skills, built their confidence and strengthened their readiness for what comes next.',
    'Over the years Mock Placements has grown into a platform that equips students with the technical expertise, the interpersonal skill and the mindset to perform under pressure, and FORESE, alongside the college, keeps pushing it further each year.',
  ],
  /** Figures pulled out of the prose so they register without being read for. */
  figures: [
    { value: '130+', label: 'HRs and industry experts', note: 'On the 2025 panels' },
    { value: '2', label: 'Modes it runs in', note: 'Online and offline' },
    { value: '3', label: 'Rounds, end to end', note: 'Aptitude, GD, interview' },
  ],
} as const;

/**
 * Companies whose HRs have sat on the mock placement panels.
 *
 * ⚠️ Worth confirming before launch: naming a company that has not taken part
 * is a claim about them, not just about us.
 *
 * `logo` points at a file that must be the company's own official artwork.
 * These are trademarks; approximating one is worse than showing none, so the
 * carousel sets the company name in the page's own typeface whenever a file is
 * missing and behaves identically in every other respect. Drop the real files
 * into `public/logos/` under the names below and they appear with no code
 * change.
 */
export interface MockPlacementCompany {
  name: string;
  /** Path under `public/`. Falls back to the name as text when absent. */
  logo?: string;
  /**
   * Optical size, 0–1, applied after the artwork is fitted to its slot.
   *
   * Fitting every logo to the same box does not make them look the same size.
   * Measured in the browser: with the artboards trimmed to their ink, Amazon
   * lands 45px tall and Cognizant 27px, because one is 3.3:1 and the other
   * 5.6:1 — both correct, and 1.67x apart. These values pull them back towards
   * equal optical area, which is the closest thing to equal weight a number
   * can express. Set by eye from the measurement; never above 1, because 1 is
   * already the edge of the slot.
   */
  logoScale?: number;
  /** Official site. Opened in a new tab from the carousel. */
  website: string;
}

export const MOCK_PLACEMENT_COMPANIES: MockPlacementCompany[] = [
  {
    name: 'Cognizant',
    logo: '/logos/cognizant.svg',
    logoScale: 1,
    website: 'https://www.cognizant.com/in/en',
  },
  { name: 'Zoho', logo: '/logos/zoho.svg', website: 'https://www.zoho.com/' },
  { name: 'Amazon', logo: '/logos/amazon.svg', logoScale: 0.78, website: 'https://www.amazon.in/' },
  { name: 'L&T', logo: '/logos/lnt.svg', website: 'https://www.lnt.in/' },
  {
    name: 'HCLTech',
    logo: '/logos/hcltech.svg',
    logoScale: 1,
    website: 'https://www.hcltech.com/',
  },
  { name: 'TCS', logo: '/logos/tcs.svg', website: 'https://www.tcs.com/' },
  { name: 'Wipro', logo: '/logos/wipro.svg', website: 'https://www.wipro.com/' },
  { name: 'Freshworks', logo: '/logos/freshworks.svg', website: 'https://www.freshworks.com/' },
  {
    name: 'Capgemini',
    logo: '/logos/capgemini.svg',
    logoScale: 0.9,
    website: 'https://www.capgemini.com/',
  },
  {
    name: 'Accenture',
    logo: '/logos/accenture.svg',
    logoScale: 0.83,
    website: 'https://www.accenture.com/in-en',
  },
];

/**
 * The shape the carousel wants, built once. Mapping inline in the JSX gave the
 * array a new identity on every render, which tore down and re-ran both of the
 * carousel's effects — including the one that owns the canvas.
 */
export const MOCK_PLACEMENT_CAROUSEL_LOGOS = MOCK_PLACEMENT_COMPANIES.map((company) => ({
  name: company.name,
  src: company.logo,
  href: company.website,
  scale: company.logoScale,
}));

export const MOCK_PLACEMENTS_COMPANIES_TITLE = 'Companies on the panels';

/* ============================================================================
 * PREPARATION BOARD
 * ----------------------------------------------------------------------------
 * The five things a student actually wants to know about, as a board of cards
 * rather than as prose. It replaces the three-paragraph description, which
 * said all of this correctly and was a wall of text nobody finished.
 * ==========================================================================*/

/**
 * Where one scattered thumbnail sits, as a percentage of the stage.
 *
 * The stage keeps a constant 16/7 aspect at every desktop width, so a position
 * proved safe once is safe everywhere — that is the whole reason these are
 * percentages and not pixels.
 *
 * INVARIANT, checked by eye against every arrangement below:
 *   8 <= x <= 92        (never leaves the stage)
 *   13 <= y <= 87
 *   x < 28 || x > 72    (never touches the centre card)
 */
export interface BoardSlot {
  x: number;
  y: number;
  /** Degrees. Small: past about eight a card stops looking placed and starts looking dropped. */
  rotate: number;
  /** Pixels of pointer parallax. Varying it per card is what reads as depth. */
  depth: number;
}

/** One arrangement per topic, so switching tabs visibly re-scatters the board. */
export const BOARD_ARRANGEMENTS: BoardSlot[][] = [
  [
    { x: 14, y: 26, rotate: -7, depth: 18 },
    { x: 21, y: 70, rotate: 5, depth: 12 },
    { x: 79, y: 22, rotate: 6, depth: 16 },
    { x: 84, y: 66, rotate: -4, depth: 10 },
  ],
  [
    { x: 24, y: 20, rotate: -5, depth: 18 },
    { x: 17, y: 62, rotate: 6, depth: 14 },
    { x: 84, y: 34, rotate: -6, depth: 11 },
    { x: 76, y: 74, rotate: 4, depth: 16 },
  ],
  [
    { x: 12, y: 44, rotate: -4, depth: 17 },
    { x: 26, y: 74, rotate: 7, depth: 11 },
    { x: 88, y: 52, rotate: 5, depth: 13 },
    { x: 74, y: 18, rotate: -6, depth: 15 },
  ],
  [
    { x: 20, y: 32, rotate: 5, depth: 12 },
    { x: 13, y: 74, rotate: -6, depth: 16 },
    { x: 80, y: 62, rotate: -5, depth: 18 },
    { x: 87, y: 26, rotate: 4, depth: 10 },
  ],
  [
    { x: 16, y: 22, rotate: 6, depth: 15 },
    { x: 23, y: 68, rotate: -5, depth: 12 },
    { x: 86, y: 30, rotate: -6, depth: 14 },
    { x: 78, y: 70, rotate: 5, depth: 17 },
  ],
];

export interface PrepTopic {
  id: string;
  /** Tab label, and the card's own category. One or two words so five fit a row. */
  label: string;
  title: string;
  body: string;
  /** Four short labels for the satellite thumbnails. Nouns, not sentences. */
  chips: [string, string, string, string];
  /**
   * What each of those four reveals when its card is flipped, in order.
   *
   * A line, not a restatement of the tag: the flip is a peek, and a card that
   * turns over to repeat what was already printed on it is a pointless one.
   */
  chipFlips: [string, string, string, string];
}

/**
 * ⚠️ `tips` and `resume` are DRAFTS. The other three are drawn from the
 * process steps below, which are the club's own words. Nobody has written
 * these two yet, and they read as plausible rather than as true — replace them
 * before this goes anywhere public.
 */
export const PREP_TOPICS: PrepTopic[] = [
  {
    id: 'tips',
    label: 'Tips',
    title: 'Turn up knowing what happens',
    body: 'Most of what goes wrong on the day is not a skills problem. It is not knowing the order of the rounds, what the panel is looking for, or how long you have. Everything on this board is the answer to that, gathered from the people who have run it.',
    chips: ['Know the format', 'Time yourself', 'Ask questions', 'Read the room'],
    chipFlips: [
      'Six stages. Three of them are yours.',
      'The aptitude round is timed. Practise against a clock.',
      'The panel expects one at the end. Have it ready.',
      'In a group discussion, listening is scored too.',
    ],
  },
  {
    id: 'resume',
    label: 'Resume',
    title: 'One page a stranger can read',
    body: 'The panel sees your resume for about thirty seconds before you sit down, and it sets every question that follows. The Resume Clinic reviews it one to one before the mock placements, so what you hand over is the version you meant to write.',
    chips: ['One page', 'Projects first', 'No jargon', 'Clinic review'],
    chipFlips: [
      'Anything longer than a page is not read.',
      'The panel asks about what you built, not what you listed.',
      'If you cannot explain it out loud, cut it.',
      'The Resume Clinic reviews it one to one, before the day.',
    ],
  },
  {
    id: 'aptitude',
    label: 'Aptitude',
    title: 'The round that decides the rest',
    body: 'An aptitude test conducted by the college. Every pre-final year student writes it on the college portal, and the scores carry forward into allocation.',
    chips: ['College portal', 'All pre-finals', 'Scored', 'Feeds allocation'],
    chipFlips: [
      'Written on the college portal, not here.',
      'Every pre-final year sits it. There is no opting out.',
      'Your score is recorded and kept.',
      'It is what decides which panel you face.',
    ],
  },
  {
    id: 'group-discussion',
    label: 'Group Discussion',
    title: 'Judged on how you carry a group',
    body: 'The college brings in panellists who run the discussion rounds and evaluate each participant on structure, clarity and how they carry a group.',
    chips: ['Structure', 'Clarity', 'Panellists', 'Live rounds'],
    chipFlips: [
      'Open, argue, close. In that order.',
      'Marked on being understood, not on being loudest.',
      'Evaluated by panellists the college invites in.',
      'Run live, in front of the people scoring it.',
    ],
  },
  {
    id: 'interview',
    label: 'Interview',
    title: 'One to one, with real HRs',
    body: 'HRs from different companies conduct one-on-one mock interviews. Students bring their report into the room and leave with direct feedback from the people who do this for a living.',
    chips: ['One to one', 'Real HRs', 'Your report', 'Direct feedback'],
    chipFlips: [
      'One student, one HR, one room.',
      '130+ took part in 2025.',
      'Bring your aptitude and group discussion report in with you.',
      'You leave knowing what to fix.',
    ],
  },
];

export const PREP_BOARD = {
  eyebrow: 'What to expect',
  title: 'Five things worth knowing before the day',
  tablistLabel: 'Choose a preparation topic',
} as const;

export interface ProcessStep {
  /** Stable id, also used as the anchor target. */
  id: string;
  title: string;
  description: string;
  /** Shown inside the node on the rail. */
  icon: LucideIcon;
  /**
   * When this stage happens. Rendered above the card, in the manner of the
   * reference timeline. Omit while a date is unconfirmed — the step then
   * renders without a date line rather than showing an empty one.
   */
  timing?: string;
  /** Optional call to action, e.g. the portal a stage is run on. */
  action?: {
    label: string;
    href: string;
  };
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'contact-collection',
    title: 'Contact collection',
    description:
      'The team builds the list the whole process depends on: HR and talent-acquisition contacts across companies, gathered through alumni, past recruiters and industry connections.',
    icon: Contact,
  },
  {
    id: 'hr-calling',
    title: 'HR calling',
    description:
      'Members reach out to every contact on that list, explain what the mock placements are for, and confirm which professionals are able to take a panel.',
    icon: PhoneCall,
  },
  {
    id: 'aptitude',
    title: 'Aptitude',
    description:
      'An aptitude test conducted by the college. Every pre-final year student writes it on the college portal, and the scores carry forward into allocation.',
    icon: PencilRuler,
    // TODO: replace with the real portal URL when the college publishes it.
    // Until then this points at a placeholder so the layout is built and
    // reviewed with the button in place.
    action: {
      label: 'Aptitude test portal',
      href: 'https://example.com/forese-aptitude',
    },
  },
  {
    id: 'group-discussion',
    title: 'Group Discussion',
    description:
      'The college brings in panellists who run the discussion rounds and evaluate each participant on structure, clarity and how they carry a group.',
    icon: MessagesSquare,
  },
  {
    id: 'allocation',
    title: 'Allocation',
    description:
      'Aptitude and GD scores are compiled into an individual performance report, generated as a PDF and shared with each student. Students are then allocated to their interview panels.',
    icon: ClipboardCheck,
  },
  {
    id: 'mock-placements',
    title: 'Mock placements',
    description:
      'HRs from different companies conduct one-on-one mock interviews. Students bring their report into the room and leave with direct feedback from the people who do this for a living.',
    icon: Briefcase,
  },
];

/**
 * The words that survive the character stream over the About photograph.
 *
 * The four rounds first, in the order the day runs them, then the terms around
 * them. Eight rather than four because the stream fills the whole picture: with
 * four, most of the field clears to nothing and the effect reads as an empty
 * box. They are not decoration — by the time the picture is clear the reader
 * has been shown what the day consists of.
 */
export const MOCK_PLACEMENTS_STREAM_WORDS = [
  'Aptitude',
  'Discussion',
  'Interview',
  'Feedback',
  'Resume',
  'Panel',
  'Practice',
  'Offer',
];
