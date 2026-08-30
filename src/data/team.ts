import type { TeamId } from './teamIds';

/**
 * The club roster.
 *
 * ⚠️ DUMMY. Every name below is invented. Replace the whole file with the real
 * roster before this goes anywhere public.
 *
 * One person appears exactly once. A team is not a stored list of people — it
 * is everyone whose `team` is that id, and its leads are the ones with
 * `leadsTeam` set. That is what makes it impossible for a face to be rendered
 * twice, and impossible for a team's membership to drift out of sync with the
 * roster.
 */

export type MemberRank = 'senior-core' | 'junior-core' | 'member';

export interface ClubMember {
  id: string;
  name: string;
  rank: MemberRank;
  /** Title for core members, e.g. "President". Members have none. */
  role?: string;
  /** Graduating batch, shown under members' names. */
  batch?: string;
  /** Portrait under `public/`. Absent renders a monogram instead. */
  photo?: string;
  /** The team this person is on. */
  team?: TeamId;
  /** Set on the junior core who lead a team. Implies `team`. */
  leadsTeam?: TeamId;
}

export const CLUB_MEMBERS: ClubMember[] = [
  { id: 'president', name: 'Subash Menon', rank: 'senior-core', role: 'President', batch: '2027' },
  {
    id: 'vice-president',
    name: 'Yamini Venkat',
    rank: 'senior-core',
    role: 'Vice President',
    batch: '2027',
  },
  {
    id: 'secretary',
    name: 'Arjun Raghavan',
    rank: 'senior-core',
    role: 'Secretary',
    batch: '2027',
  },
  {
    id: 'joint-secretary',
    name: 'Radhika Iyer',
    rank: 'senior-core',
    role: 'Joint Secretary',
    batch: '2027',
  },
  { id: 'treasurer', name: 'Varun Ramesh', rank: 'senior-core', role: 'Treasurer', batch: '2027' },
  {
    id: 'head-of-corporate-relations',
    name: 'Aruna Natarajan',
    rank: 'senior-core',
    role: 'Head of Corporate Relations',
    batch: '2027',
  },
  {
    id: 'head-of-operations',
    name: 'Pavithra Subramanian',
    rank: 'senior-core',
    role: 'Head of Operations',
    batch: '2027',
  },
  {
    id: 'head-of-outreach',
    name: 'Deepak Gopal',
    rank: 'senior-core',
    role: 'Head of Outreach',
    batch: '2027',
  },
  {
    id: 'head-of-design',
    name: 'Balaji Raghavan',
    rank: 'senior-core',
    role: 'Head of Design',
    batch: '2027',
  },

  {
    id: 'jc-1',
    name: 'Rahul Raghavan',
    rank: 'junior-core',
    role: 'Design Lead',
    batch: '2028',
    team: 'design',
    leadsTeam: 'design',
  },
  {
    id: 'jc-2',
    name: 'Revathi Gopal',
    rank: 'junior-core',
    role: 'Design Lead',
    batch: '2028',
    team: 'design',
    leadsTeam: 'design',
  },
  {
    id: 'jc-3',
    name: 'Aruna Ramesh',
    rank: 'junior-core',
    role: 'Content Lead',
    batch: '2028',
    team: 'content',
    leadsTeam: 'content',
  },
  {
    id: 'jc-4',
    name: 'Harish Reddy',
    rank: 'junior-core',
    role: 'Content Lead',
    batch: '2028',
    team: 'content',
    leadsTeam: 'content',
  },
  {
    id: 'jc-5',
    name: 'Tanvi Venkat',
    rank: 'junior-core',
    role: 'Corporate Relations Lead',
    batch: '2028',
    team: 'corporate',
    leadsTeam: 'corporate',
  },
  {
    id: 'jc-6',
    name: 'Sathya Subramanian',
    rank: 'junior-core',
    role: 'Corporate Relations Lead',
    batch: '2028',
    team: 'corporate',
    leadsTeam: 'corporate',
  },
  {
    id: 'jc-7',
    name: 'Santhosh Ramesh',
    rank: 'junior-core',
    role: 'Events Lead',
    batch: '2028',
    team: 'events',
    leadsTeam: 'events',
  },
  {
    id: 'jc-8',
    name: 'Yamini Subramanian',
    rank: 'junior-core',
    role: 'Events Lead',
    batch: '2028',
    team: 'events',
    leadsTeam: 'events',
  },
  {
    id: 'jc-9',
    name: 'Praveen Subramanian',
    rank: 'junior-core',
    role: 'Technical Lead',
    batch: '2028',
    team: 'technical',
    leadsTeam: 'technical',
  },
  {
    id: 'jc-10',
    name: 'Rohit Menon',
    rank: 'junior-core',
    role: 'Technical Lead',
    batch: '2028',
    team: 'technical',
    leadsTeam: 'technical',
  },

  { id: 'm-1', name: 'Sathish Gopal', rank: 'member', batch: '2027', team: 'design' },
  { id: 'm-2', name: 'Raghav Iyer', rank: 'member', batch: '2029', team: 'design' },
  { id: 'm-3', name: 'Sneha Prasad', rank: 'member', batch: '2029', team: 'design' },
  { id: 'm-4', name: 'Meera Iyer', rank: 'member', batch: '2029', team: 'design' },
  { id: 'm-5', name: 'Santhosh Venkat', rank: 'member', batch: '2027', team: 'design' },
  { id: 'm-6', name: 'Vidhya Iyer', rank: 'member', batch: '2029', team: 'design' },
  { id: 'm-7', name: 'Pooja Raghavan', rank: 'member', batch: '2029', team: 'design' },
  { id: 'm-8', name: 'Aruna Sundaram', rank: 'member', batch: '2027', team: 'design' },
  { id: 'm-9', name: 'Manoj Ganesan', rank: 'member', batch: '2029', team: 'design' },
  { id: 'm-10', name: 'Charan Varma', rank: 'member', batch: '2028', team: 'design' },
  { id: 'm-11', name: 'Sathya Kumar', rank: 'member', batch: '2028', team: 'design' },
  { id: 'm-12', name: 'Shreya Reddy', rank: 'member', batch: '2027', team: 'design' },
  { id: 'm-13', name: 'Kaviya Reddy', rank: 'member', batch: '2027', team: 'design' },
  { id: 'm-14', name: 'Santhosh Sharma', rank: 'member', batch: '2029', team: 'design' },
  { id: 'm-15', name: 'Manoj Varma', rank: 'member', batch: '2029', team: 'design' },
  { id: 'm-16', name: 'Hemanth Sharma', rank: 'member', batch: '2029', team: 'design' },
  { id: 'm-17', name: 'Bhavya Iyer', rank: 'member', batch: '2029', team: 'design' },
  { id: 'm-18', name: 'Balaji Nair', rank: 'member', batch: '2028', team: 'design' },
  { id: 'm-19', name: 'Keerthana Murugan', rank: 'member', batch: '2028', team: 'content' },
  { id: 'm-20', name: 'Anjali Ganesan', rank: 'member', batch: '2027', team: 'content' },
  { id: 'm-21', name: 'Rohit Ramesh', rank: 'member', batch: '2028', team: 'content' },
  { id: 'm-22', name: 'Swetha Mahadevan', rank: 'member', batch: '2028', team: 'content' },
  { id: 'm-23', name: 'Siddharth Murugan', rank: 'member', batch: '2029', team: 'content' },
  { id: 'm-24', name: 'Indira Raghavan', rank: 'member', batch: '2027', team: 'content' },
  { id: 'm-25', name: 'Rithika Murugan', rank: 'member', batch: '2029', team: 'content' },
  { id: 'm-26', name: 'Yogesh Raghavan', rank: 'member', batch: '2027', team: 'content' },
  { id: 'm-27', name: 'Kaviya Sharma', rank: 'member', batch: '2029', team: 'content' },
  { id: 'm-28', name: 'Santhosh Ganesan', rank: 'member', batch: '2028', team: 'content' },
  { id: 'm-29', name: 'Saranya Mahadevan', rank: 'member', batch: '2028', team: 'content' },
  { id: 'm-30', name: 'Yogesh Balan', rank: 'member', batch: '2027', team: 'content' },
  { id: 'm-31', name: 'Jeevan Balan', rank: 'member', batch: '2027', team: 'content' },
  { id: 'm-32', name: 'Sriram Iyer', rank: 'member', batch: '2028', team: 'content' },
  { id: 'm-33', name: 'Aruna Pillai', rank: 'member', batch: '2028', team: 'content' },
  { id: 'm-34', name: 'Ishaan Srinivasan', rank: 'member', batch: '2027', team: 'content' },
  { id: 'm-35', name: 'Yamini Chandran', rank: 'member', batch: '2028', team: 'content' },
  { id: 'm-36', name: 'Chandru Nair', rank: 'member', batch: '2028', team: 'content' },
  { id: 'm-37', name: 'Abhinav Prasad', rank: 'member', batch: '2028', team: 'corporate' },
  { id: 'm-38', name: 'Janani Gopal', rank: 'member', batch: '2029', team: 'corporate' },
  { id: 'm-39', name: 'Sanjay Mahadevan', rank: 'member', batch: '2028', team: 'corporate' },
  { id: 'm-40', name: 'Vaishnavi Ganesan', rank: 'member', batch: '2028', team: 'corporate' },
  { id: 'm-41', name: 'Priya Menon', rank: 'member', batch: '2027', team: 'corporate' },
  { id: 'm-42', name: 'Madhan Menon', rank: 'member', batch: '2027', team: 'corporate' },
  { id: 'm-43', name: 'Vikram Reddy', rank: 'member', batch: '2027', team: 'corporate' },
  { id: 'm-44', name: 'Lavanya Ramesh', rank: 'member', batch: '2027', team: 'corporate' },
  { id: 'm-45', name: 'Ranjith Sharma', rank: 'member', batch: '2027', team: 'corporate' },
  { id: 'm-46', name: 'Kavya Gopal', rank: 'member', batch: '2029', team: 'corporate' },
  { id: 'm-47', name: 'Vidhya Sundaram', rank: 'member', batch: '2029', team: 'corporate' },
  { id: 'm-48', name: 'Srinivas Menon', rank: 'member', batch: '2029', team: 'corporate' },
  { id: 'm-49', name: 'Nikhil Sundaram', rank: 'member', batch: '2029', team: 'corporate' },
  { id: 'm-50', name: 'Nithin Srinivasan', rank: 'member', batch: '2027', team: 'corporate' },
  { id: 'm-51', name: 'Indira Ganesan', rank: 'member', batch: '2029', team: 'corporate' },
  { id: 'm-52', name: 'Abhinav Chandran', rank: 'member', batch: '2027', team: 'corporate' },
  { id: 'm-53', name: 'Karthik Venkat', rank: 'member', batch: '2028', team: 'corporate' },
  { id: 'm-54', name: 'Ashwin Pillai', rank: 'member', batch: '2028', team: 'corporate' },
  { id: 'm-55', name: 'Kishore Iyer', rank: 'member', batch: '2028', team: 'events' },
  { id: 'm-56', name: 'Siddharth Subramanian', rank: 'member', batch: '2027', team: 'events' },
  { id: 'm-57', name: 'Aarav Ramesh', rank: 'member', batch: '2027', team: 'events' },
  { id: 'm-58', name: 'Varun Sundaram', rank: 'member', batch: '2027', team: 'events' },
  { id: 'm-59', name: 'Bhavya Pillai', rank: 'member', batch: '2029', team: 'events' },
  { id: 'm-60', name: 'Vignesh Menon', rank: 'member', batch: '2029', team: 'events' },
  { id: 'm-61', name: 'Ramya Balan', rank: 'member', batch: '2029', team: 'events' },
  { id: 'm-62', name: 'Varun Murugan', rank: 'member', batch: '2027', team: 'events' },
  { id: 'm-63', name: 'Harini Murugan', rank: 'member', batch: '2028', team: 'events' },
  { id: 'm-64', name: 'Karthik Murugan', rank: 'member', batch: '2028', team: 'events' },
  { id: 'm-65', name: 'Chandru Menon', rank: 'member', batch: '2027', team: 'events' },
  { id: 'm-66', name: 'Swetha Srinivasan', rank: 'member', batch: '2028', team: 'events' },
  { id: 'm-67', name: 'Karthik Mahadevan', rank: 'member', batch: '2027', team: 'events' },
  { id: 'm-68', name: 'Poornima Krishnan', rank: 'member', batch: '2027', team: 'events' },
  { id: 'm-69', name: 'Prakash Balan', rank: 'member', batch: '2027', team: 'events' },
  { id: 'm-70', name: 'Dinesh Prasad', rank: 'member', batch: '2027', team: 'events' },
  { id: 'm-71', name: 'Prakash Sharma', rank: 'member', batch: '2029', team: 'events' },
  { id: 'm-72', name: 'Deepak Mahadevan', rank: 'member', batch: '2028', team: 'events' },
  { id: 'm-73', name: 'Poornima Balan', rank: 'member', batch: '2027', team: 'technical' },
  { id: 'm-74', name: 'Vaishnavi Reddy', rank: 'member', batch: '2029', team: 'technical' },
  { id: 'm-75', name: 'Raghav Natarajan', rank: 'member', batch: '2028', team: 'technical' },
  { id: 'm-76', name: 'Uma Reddy', rank: 'member', batch: '2029', team: 'technical' },
  { id: 'm-77', name: 'Mithun Reddy', rank: 'member', batch: '2028', team: 'technical' },
  { id: 'm-78', name: 'Priya Pillai', rank: 'member', batch: '2029', team: 'technical' },
  { id: 'm-79', name: 'Manoj Balan', rank: 'member', batch: '2029', team: 'technical' },
  { id: 'm-80', name: 'Ananya Krishnan', rank: 'member', batch: '2028', team: 'technical' },
  { id: 'm-81', name: 'Kalyani Rao', rank: 'member', batch: '2027', team: 'technical' },
  { id: 'm-82', name: 'Dinesh Sundaram', rank: 'member', batch: '2028', team: 'technical' },
  { id: 'm-83', name: 'Hemanth Srinivasan', rank: 'member', batch: '2028', team: 'technical' },
  { id: 'm-84', name: 'Varun Raghavan', rank: 'member', batch: '2027', team: 'technical' },
  { id: 'm-85', name: 'Gokul Reddy', rank: 'member', batch: '2028', team: 'technical' },
  { id: 'm-86', name: 'Naveen Varma', rank: 'member', batch: '2027', team: 'technical' },
  { id: 'm-87', name: 'Karthik Sundaram', rank: 'member', batch: '2029', team: 'technical' },
  { id: 'm-88', name: 'Aarav Murugan', rank: 'member', batch: '2029', team: 'technical' },
  { id: 'm-89', name: 'Tharun Venkat', rank: 'member', batch: '2027', team: 'technical' },
  { id: 'm-90', name: 'Vikram Iyer', rank: 'member', batch: '2028', team: 'technical' },
];
