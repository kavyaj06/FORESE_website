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
    'The drive runs in six stages. The first two are the work the team does before a single student registers — finding the professionals who will sit on the panels. The rest is the process students go through.',
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
      'The team builds the list the whole drive depends on — HR and talent-acquisition contacts across companies, gathered through alumni, past recruiters and industry connections.',
    icon: Contact,
  },
  {
    id: 'hr-calling',
    title: 'HR calling',
    description:
      'Members reach out to every contact on that list, explain what the mock drive is for, and confirm which professionals are able to take a panel.',
    icon: PhoneCall,
  },
  {
    id: 'aptitude',
    title: 'Aptitude',
    description:
      'An aptitude test conducted by the college. Registered students write it on the college portal, and the scores carry forward into allocation.',
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
