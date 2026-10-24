import {
  Award,
  Brain,
  Briefcase,
  Clock,
  Eye,
  Flame,
  ListChecks,
  MessageSquare,
  MessagesSquare,
  Megaphone,
  MicOff,
  PenLine,
  Scale,
  ScanSearch,
  Scissors,
  Shuffle,
  SpellCheck,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * Interview Tips — page content.
 *
 * Carried over from the club's previous website, where this material was
 * three separate pages: the group discussion guide, the aptitude page and the
 * resume tips. The wording is theirs, not a paraphrase of it — the only
 * changes are sentence case for headings, to match the voice everywhere else
 * on this site, and the two glosses marked below.
 *
 * One page rather than three because the three are read on the same evening,
 * by a student the week before mock placements, and because a site with three
 * thin pages of advice hides all of it.
 */

/** An icon, a title and a paragraph. The page's most common unit. */
export interface TipItem {
  title: string;
  body: string;
  icon: LucideIcon;
}

export const TIPS_HERO = {
  eyebrow: 'Preparation',
  title: 'Interview Tips',
  description:
    'Three things decide most placement days: how you carry a group discussion, how you work an aptitude paper, and what your resume says in the few seconds someone spends reading it. Here is what we tell students about each.',
} as const;

/**
 * The three acts, in order.
 *
 * Read twice — by the sticky rail at the top of the page and by each act's own
 * header — so the number beside a heading and the number in the rail cannot
 * disagree. The `id` is the anchor target as well as the key.
 */
export interface TipsTopic {
  id: string;
  label: string;
}

export const TIPS_TOPICS: TipsTopic[] = [
  { id: 'group-discussion', label: 'Group discussion' },
  { id: 'aptitude', label: 'Aptitude' },
  { id: 'resume', label: 'Resume' },
];

/* ============================================================================
 * 01 — GROUP DISCUSSION
 * ==========================================================================*/

/**
 * The photograph beside the opening.
 *
 * Named by id rather than by path so it travels with the gallery: the picture
 * is the group discussion round of LEAP 2026, and the page falls back to the
 * text column alone if the club ever removes it. The caption is the old site's
 * own line; the alt text stays whatever the gallery says the picture shows,
 * which is a description rather than a slogan.
 */
export const GROUP_DISCUSSION_PHOTO_ID = 'leap-2026-6';

export const GROUP_DISCUSSION_INTRO = {
  eyebrow: 'Learn the art of strategic communication',
  title: 'Group discussion mastery guide',
  lead: 'Transform your communication skills with our proven strategies. This guide is designed to help you excel in the mock group discussions and stand out in your placements.',
  caption: 'Real-world preparation for professional success.',
} as const;

export const GROUP_DISCUSSION_BENEFITS: {
  title: string;
  description: string;
  items: TipItem[];
} = {
  title: 'Unlock your potential',
  description: 'Mastering group discussions offers game-changing benefits for your career.',
  items: [
    {
      title: 'Enhanced critical thinking',
      body: 'Develop analytical skills by evaluating different perspectives and forming well-reasoned arguments.',
      icon: Brain,
    },
    {
      title: 'Improved communication',
      body: 'Build confidence in expressing ideas clearly and persuasively in professional settings.',
      icon: MessagesSquare,
    },
    {
      title: 'Leadership skills',
      body: 'Learn to guide conversations, mediate conflicts, and influence group dynamics positively.',
      icon: Users,
    },
    {
      title: 'Quick decision making',
      body: 'Practice making informed decisions under time pressure while considering multiple viewpoints.',
      icon: Target,
    },
    {
      title: 'Career advancement',
      body: 'Stand out in interviews and workplace meetings with polished discussion abilities.',
      icon: TrendingUp,
    },
    {
      title: 'Confidence building',
      body: 'Overcome public speaking anxiety and build self-assurance in group settings.',
      icon: Award,
    },
  ],
};

/** One phase of a discussion, and when in the round it happens. */
export interface DiscussionPhase {
  title: string;
  /** Where in the round this sits — "First 2-3 minutes". */
  timing: string;
  body: string;
  icon: LucideIcon;
}

export const GROUP_DISCUSSION_PLAYBOOK: {
  title: string;
  description: string;
  phases: DiscussionPhase[];
} = {
  title: 'The winning playbook',
  description: 'Master these four phases to navigate any group discussion with confidence.',
  phases: [
    {
      title: 'Observation phase',
      timing: 'First 2-3 minutes',
      body: 'Listen carefully to understand the topic and gauge group dynamics before contributing.',
      icon: Eye,
    },
    {
      title: 'Initial contribution',
      timing: 'Minutes 3-5',
      body: 'Make your first meaningful contribution with a clear stance or relevant insight.',
      icon: MessageSquare,
    },
    {
      title: 'Active participation',
      timing: 'Middle phase',
      body: 'Engage actively while balancing speaking time with others and building on ideas.',
      icon: Users,
    },
    {
      title: 'Conclusion building',
      timing: 'Final minutes',
      body: 'Help synthesize key points and work toward group consensus or clear outcomes.',
      icon: Target,
    },
  ],
};

/** A heading and the four things to do under it. */
export interface StrategyColumn {
  title: string;
  icon: LucideIcon;
  points: string[];
}

export const GROUP_DISCUSSION_STRATEGIES: {
  title: string;
  description: string;
  columns: StrategyColumn[];
} = {
  title: 'Pro strategies',
  description: 'Adopt these battle-tested techniques to make a lasting impression.',
  columns: [
    {
      title: 'Before speaking',
      icon: Eye,
      points: [
        "Listen actively to understand others' viewpoints.",
        'Take brief notes to organize your thoughts.',
        'Wait for appropriate moments to contribute.',
        'Prepare key points mentally before speaking.',
      ],
    },
    {
      title: 'While speaking',
      icon: MessageSquare,
      points: [
        'Speak clearly and at a moderate pace.',
        'Make eye contact with group members.',
        'Use specific examples to support your points.',
        'Keep contributions concise and relevant.',
      ],
    },
    {
      title: 'Group dynamics',
      icon: Users,
      points: [
        'Encourage quieter members to participate.',
        "Build on others' ideas constructively.",
        'Handle disagreements respectfully.',
        'Stay focused on the topic at hand.',
      ],
    },
  ],
};

export const GROUP_DISCUSSION_MISTAKES: {
  title: string;
  description: string;
  items: { label: string; icon: LucideIcon }[];
} = {
  title: 'Mistakes to avoid',
  description: "Don't let these common pitfalls sabotage your performance.",
  items: [
    { label: 'Dominating the conversation', icon: Megaphone },
    { label: 'Not listening to others', icon: MicOff },
    { label: 'Speaking without preparation', icon: PenLine },
    { label: 'Being overly aggressive', icon: Flame },
    { label: 'Staying completely silent', icon: MessageSquare },
    { label: 'Going off-topic frequently', icon: Shuffle },
  ],
};

/* ============================================================================
 * 02 — APTITUDE
 * ==========================================================================*/

export const APTITUDE_INTRO = {
  eyebrow: 'Quantitative, logical and verbal',
  title: 'FORESE Aptitude',
  lead: 'Practice modules, quizzes, and mentorship to strengthen Quantitative, Logical, and Verbal skills for placements and exams. Join our structured training with mock tests and analytics.',
  body: "The Aptitude Test evaluates key skills, including logical reasoning, analytical thinking, numerical ability, and problem-solving, all of which are essential for success in a competitive environment. This year's assessment includes thoughtfully developed questions that enable participants to demonstrate their strengths. Each section aligns with various academic fields to ensure the test remains relevant to students' diverse career paths and goals.",
} as const;

/**
 * The three areas the paper is built from.
 *
 * ⚠️ The names are the club's — the line above names Quantitative, Logical and
 * Verbal — but the one-line glosses under them are mine: standard descriptions
 * of what each section contains, not a claim about this particular paper.
 * Worth a look from whoever sets it before anyone revises against them.
 */
export const APTITUDE_FOCUS: TipItem[] = [
  {
    title: 'Quantitative',
    body: 'Numerical ability and the arithmetic underneath it — percentages, ratios, averages, time and work.',
    icon: Scale,
  },
  {
    title: 'Logical',
    body: 'Reasoning and analytical thinking: sequences, arrangements, and problems that reward a method over a guess.',
    icon: ScanSearch,
  },
  {
    title: 'Verbal',
    body: 'Comprehension and usage — reading a passage closely and choosing the word that actually fits.',
    icon: ListChecks,
  },
];

export const APTITUDE_OBJECTIVES: {
  title: string;
  description: string;
  items: TipItem[];
} = {
  title: 'Key objectives',
  description: 'What the test is built to do for the people sitting it.',
  items: [
    {
      title: 'Identifying strengths and weaknesses',
      body: 'Providing candidates with clear feedback on their strengths and areas for improvement.',
      icon: Target,
    },
    {
      title: 'Aligning skills with interests',
      body: 'Helping candidates identify how their skills align with their career goals.',
      icon: Briefcase,
    },
    {
      title: 'Enhancing time management',
      body: 'Effective time management under pressure is crucial for achieving success in both academic and professional environments.',
      icon: Clock,
    },
    {
      title: 'Fostering critical thinking',
      body: 'Developing the capacity to systematically evaluate information and address complex problems using strategic reasoning.',
      icon: Brain,
    },
  ],
};

/* ============================================================================
 * 03 — RESUME
 * ==========================================================================*/

export const RESUME_INTRO = {
  eyebrow: 'One page, six seconds',
  title: 'Resume building tips',
  lead: 'Craft a winning resume with these expert tips to stand out from the competition and land your dream job.',
} as const;

export const RESUME_TIPS: {
  title: string;
  description: string;
  items: TipItem[];
} = {
  title: 'Expert resume tips',
  description: 'Master the art of resume writing with these proven strategies.',
  items: [
    {
      title: 'Tailor your resume',
      body: 'Customize your resume for each job application. Match keywords from the job description to increase your chances of passing ATS systems.',
      icon: Target,
    },
    {
      title: 'Quantify achievements',
      body: "Use numbers and metrics to showcase your impact. Instead of 'improved sales,' write 'increased sales by 25% over 6 months.'",
      icon: TrendingUp,
    },
    {
      title: 'Keep it concise',
      body: 'Limit your resume to 1-2 pages. Use bullet points and concise language. Recruiters spend only 6-10 seconds scanning each resume.',
      icon: Scissors,
    },
    {
      title: 'Highlight skills',
      body: 'Create a dedicated skills section with both technical and soft skills relevant to your target role. Include certifications and tools you are proficient in.',
      icon: Award,
    },
    {
      title: 'Professional format',
      body: "Use a clean, professional layout with consistent fonts and spacing. Avoid graphics and photos unless you're in a creative field.",
      icon: ListChecks,
    },
    {
      title: 'Proofread carefully',
      body: 'Check for typos, grammatical errors, and formatting inconsistencies. Have someone else review your resume before submitting.',
      icon: SpellCheck,
    },
  ],
};
