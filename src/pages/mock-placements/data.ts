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
  /** Official site. Opened in a new tab from the carousel. */
  website: string;
}

export const MOCK_PLACEMENT_COMPANIES: MockPlacementCompany[] = [
  { name: 'Cognizant', logo: '/logos/cognizant.svg', website: 'https://www.cognizant.com/in/en' },
  { name: 'Zoho', logo: '/logos/zoho.svg', website: 'https://www.zoho.com/' },
  { name: 'Amazon', logo: '/logos/amazon.svg', website: 'https://www.amazon.in/' },
  { name: 'L&T', logo: '/logos/lnt.svg', website: 'https://www.lnt.in/' },
  { name: 'HCLTech', logo: '/logos/hcltech.svg', website: 'https://www.hcltech.com/' },
  { name: 'TCS', logo: '/logos/tcs.svg', website: 'https://www.tcs.com/' },
  { name: 'Wipro', logo: '/logos/wipro.svg', website: 'https://www.wipro.com/' },
  { name: 'Freshworks', logo: '/logos/freshworks.svg', website: 'https://www.freshworks.com/' },
  { name: 'Capgemini', logo: '/logos/capgemini.svg', website: 'https://www.capgemini.com/' },
  { name: 'Accenture', logo: '/logos/accenture.svg', website: 'https://www.accenture.com/in-en' },
];

export const MOCK_PLACEMENTS_COMPANIES_TITLE = 'Companies on the panels';

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
