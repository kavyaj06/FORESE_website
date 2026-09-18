import type { TeamId } from './teamIds';

/**
 * The club roster.
 *
 * Senior core and junior core (below) have the club's real names and real
 * titles.
 *
 * Senior core and senior members are the club's own records: names, titles,
 * one-liners, LinkedIn profiles and photograph filenames, exactly as supplied.
 * No email addresses came with them, so none are set — a card simply shows the
 * one link it has. Inventing a plausible address is the dangerous kind of
 * placeholder, because it ships unnoticed and sends mail to whoever owns it.
 *
 * `photo` names a file under `public/images/`. The filenames are the club's,
 * and the pictures arrive separately; until one is on disk the card falls back
 * to the person's initials rather than a broken image, so the roster can be
 * correct before the images are.
 *
 * ⚠️ Two junior core entries (`raghav-gs`, `srindhi-sarasija`) are still
 * DUMMY placeholders — invented quotes and links — standing in until the club
 * supplies theirs. They are deliberately unusable rather than merely
 * invented: emails use `example.com`, the domain RFC 2606 reserves so it can
 * never resolve, and every invented LinkedIn slug ends `-placeholder` so it
 * cannot collide with a stranger's real profile.
 *
 * One person appears exactly once. A working team is not a stored list: it is
 * everyone whose `team` matches its id. That is what makes it impossible for
 * a face to be rendered twice, and impossible for a team's membership to
 * drift out of sync with the roster.
 *
 * The five working teams sit inside the two member ranks only. Core carry no
 * team: senior and junior core manage all five collectively rather than each
 * leading one.
 *
 * `senior-member` is now the club's own list of 59 rather than a batch the
 * site inferred, and those people carry no working team: the club presents
 * them as one body, and the page divides only `member` by team.
 *
 * `member` is now the club's own list of 84 real people too — names and
 * photographs from the club's own submission form, in alphabetical order by
 * first name. None carries a `team` yet: which working team each of them is
 * on has not been confirmed, so the page shows them all under "All" until
 * that comes in and each entry gets its `team` set. None has a `quote`,
 * `linkedin`, `email` or `batch` either, for the same reason the senior-core
 * fields above are sometimes absent — none of that arrived with the photos,
 * and inventing it would be the dangerous kind of placeholder.
 */

export type MemberRank =
  'senior-core' | 'junior-core' | 'lead' | 'senior-executive' | 'senior-member' | 'member';

export interface ClubMember {
  id: string;
  name: string;
  rank: MemberRank;
  /** Title for core members. Members have none. */
  role?: string;
  batch?: string;
  /** Portrait under `public/`. Absent renders a monogram instead. */
  photo?: string;
  /**
   * How the photograph sits in its frame, when the default centre crop is
   * wrong for it.
   *
   * `photoPosition` is a CSS `object-position`; a larger second value shows
   * more of the lower part of the picture, which lifts the subject up the
   * frame. `photoZoom` scales the image inside the frame for a tighter crop.
   *
   * Per person rather than one rule for everyone, because the framing that
   * needs correcting is a property of the individual photograph — where the
   * subject happens to stand in it and how much room is around them — and no
   * single crop is right for a hundred pictures taken by a hundred people.
   * Absent on almost every entry, which is the point: it is a correction, not
   * a setting.
   */
  photoPosition?: string;
  photoZoom?: number;
  /** One line, in their own words. Shown on their card. */
  quote?: string;
  linkedin?: string;
  email?: string;
  /** Working team. Members and senior members only. */
  team?: TeamId;
}

export const CLUB_MEMBERS: ClubMember[] = [
  {
    id: 'anushri-k',
    name: 'Anushri K',
    rank: 'senior-core',
    role: 'General Secretary',
    photo: '/images/c11.jpg',
    quote: 'Travel more, worry less, spread kindness',
    linkedin: 'https://www.linkedin.com/in/anu-shri/',
  },
  {
    id: 'kaamesh-kc',
    name: 'Kaamesh KC',
    rank: 'senior-core',
    role: 'Vice President',
    photo: '/images/c10.jpg',
    quote: "Power is a lot like real estate. It's all about location, location, location.",
    linkedin: 'https://www.linkedin.com/in/kaamesh-kc-5714b029a/',
  },
  {
    id: 'salma-siddique',
    name: 'Salma Siddique',
    rank: 'senior-core',
    role: 'General Secretary',
    photo: '/images/c14.jpg',
    quote: 'I believe I can, and thus I become',
    linkedin: 'https://www.linkedin.com/in/salma-siddique-962608320/',
  },
  {
    id: 'sarvesh-vaidhi',
    name: 'Sarvesh Vaidhi',
    rank: 'senior-core',
    role: 'General Secretary',
    photo: '/images/c13.jpg',
    quote: 'Procrastination final boss',
    linkedin: 'https://www.linkedin.com/in/sarvesh-vaidhi-0554972b8/',
  },
  {
    id: 'siddharth-naren',
    name: 'Siddharth Naren',
    rank: 'senior-core',
    role: 'General Secretary',
    photo: '/images/c12.jpg',
    quote: 'Life gave me lemons, but forgot the sugar and water',
    linkedin: 'https://www.linkedin.com/in/siddharth-naren-baskaran/',
  },
  {
    id: 'mubashir-sheriff',
    name: 'Mubashir Sheriff',
    rank: 'senior-core',
    role: 'President',
    photo: '/images/c15.jpg',
    quote: 'What matters lies neither in the beginning nor in the end',
    linkedin: 'https://www.linkedin.com/in/r-mubashir-sheriff/',
  },
  {
    id: 'thamizh-selvan',
    name: 'Thamizh Selvan',
    rank: 'senior-core',
    role: 'General Secretary',
    photo: '/images/c16.jpg',
    quote: '404 Sleep Not Found',
    linkedin: 'https://www.linkedin.com/in/thamizhselvan1/',
  },
  {
    id: 'visvajith',
    name: 'Visvajith',
    rank: 'senior-core',
    role: 'General Secretary',
    photo: '/images/c17.jpg',
    quote: 'Tech enthusiast with a love for watches, cars, and creating cool projects',
    linkedin: 'https://www.linkedin.com/in/visvajith-logasuresh-796a4b329/',
  },
  {
    id: 'shree-kowsik',
    name: 'Shree Kowsik',
    rank: 'senior-core',
    role: 'Vice President',
    photo: '/images/c18.jpg',
    quote: 'Veni Vidi Vici',
    linkedin: 'https://www.linkedin.com/in/shree-kowsik-s-b-520b9828b/',
  },
  {
    id: 'pragadeesh',
    name: 'Pragadeeshwaran',
    photo: '/images/c1.jpg',
    rank: 'junior-core',
    role: 'Executive Director',
    quote: 'aura comes after me',
    email: 'pragadeesh2907@gmail.com',
  },
  {
    id: 'sai-shruthe',
    name: 'Sai Srutthe',
    photo: '/images/c2.jpg',
    rank: 'junior-core',
    role: 'Executive Director',
    quote: 'Just here for the lore',
    linkedin: 'https://www.linkedin.com/in/sai-srutthe-saravana-kumar-263122359/',
    email: 'srusk209@gmail.com',
  },
  {
    id: 'mayooritha',
    name: 'Mayooritha',
    photoPosition: '50% 68%',
    photo: '/images/c8.jpg',
    rank: 'junior-core',
    role: 'Executive Director',
    quote: "The world's my oyster.",
    linkedin: 'https://www.linkedin.com/in/mayooritha-pugazhenthi-8a43b0327/',
    email: 'mayoorithapugazh@gmail.com',
  },
  {
    id: 'ananya-ed',
    name: 'Ananya Kannan',
    photo: '/images/c3.jpg',
    rank: 'junior-core',
    role: 'Executive Director',
    quote: 'Brains, Sass and a passport full of dreams.',
    linkedin: 'https://www.linkedin.com/in/ananyakannan07/',
    email: 'ananyakannan1502@gmail.com',
  },
  {
    id: 'srindhi-sarasija',
    name: 'Srindhi Sarasija',
    photo: '/images/c6.jpg',
    rank: 'junior-core',
    role: 'Executive Director',
    quote: 'Every year we hand over a slightly better version of the process.',
    linkedin: 'https://www.linkedin.com/in/srindhi-sarasija-placeholder',
    email: 'srindhi-sarasija@example.com',
  },
  {
    id: 'pranaya',
    name: 'Pranaya',
    photo: '/images/c4.jpg',
    rank: 'junior-core',
    role: 'Executive Director',
    quote: 'A limited edition with unlimited issues',
    linkedin: 'https://www.linkedin.com/in/m-pranaya-576842383/',
    email: 'pranaya0207@gmail.com',
  },
  {
    id: 'raghav-gs',
    name: 'Raghav GS',
    rank: 'junior-core',
    role: 'Tech Head',
    quote: 'Most of the tooling exists because someone got tired of doing it by hand.',
    linkedin: 'https://www.linkedin.com/in/raghav-gs-placeholder',
    email: 'raghav-gs@example.com',
  },
  {
    id: 'kavya-j',
    name: 'Kavya J',
    photoPosition: '50% 38%',
    photoZoom: 1.35,
    photo: '/images/c21.jpg',
    rank: 'junior-core',
    role: 'Tech Head',
    quote: 'Respectfully, we move.',
    linkedin: 'https://www.linkedin.com/in/kavya-jamindarganesh/',
    email: 'kavyaganesh1011@gmail.com',
  },
  {
    id: 'shrenik',
    name: 'B S Shrenik',
    photo: '/images/c5.jpg',
    rank: 'junior-core',
    role: 'Communications Chair',
    quote: 'My vibe is my signature',
    linkedin: 'https://www.linkedin.com/in/bsshrenik/',
    email: 'bsshrenik@gmail.com',
  },
  {
    id: 'nikhil-abhishek',
    name: 'E.S.Nikhil Abisheik',
    rank: 'junior-core',
    role: 'Treasurer',
    quote: 'Highest in the room',
    email: 'Nikhil.abisheik@gmail.com',
  },
  /**
   * The three leads and the three senior executives, as the club gave them.
   *
   * Real names, so nothing here is invented: no quote, no LinkedIn and no
   * email until the club supplies them. An absent field renders as nothing;
   * a plausible-looking one ships unnoticed and points at a stranger.
   */
  {
    id: 'pooja-dharshini',
    name: 'Pooja Dharshini S',
    photo: '/images/c7.jpg',
    rank: 'lead',
    role: 'Marketing Lead',
    quote: 'i was here (apparently)',
    linkedin: 'https://www.linkedin.com/in/poojadharshinishantharaman/',
    email: 's.poojadharshini@gmail.com',
  },
  {
    id: 'tharani-pillai',
    name: 'Tharini A L',
    photo: '/images/c20.jpg',
    rank: 'lead',
    role: 'Design Lead',
    quote: "i've got wabi sabi",
    linkedin: 'https://www.linkedin.com/in/tharini-a-l-ya88adee88a',
    email: 'tharini.pillai@gmail.com',
  },
  {
    id: 'nithesh-kumar',
    name: 'Nithesh Kumar RG',
    rank: 'lead',
    role: 'Videography Lead',
    quote: "Zlatan doesn't do auditions",
    linkedin: 'https://www.linkedin.com/in/nithesh-kumar-rg-89b061327/',
    email: 'nitheshrg2006@gmail.com',
    photo: '/images/c9.jpg',
  },
  {
    // "Lathika R" as the club's own roster has it, rather than the bare
    // "Lathika" of the spoken instruction — the same call made for Kishore.
    id: 'lathika-r',
    name: 'Lathika R',
    rank: 'senior-executive',
    role: 'Senior Marketing Executive',
    photo: '/images/c19.jpg',
    quote: 'Make today count!',
    linkedin: 'https://www.linkedin.com/in/lathika-ramachandran-b58297328/',
  },
  {
    // "Viswanathan L" as the roster and his LinkedIn slug have it. The roster
    // also holds a Vishwanth CR, who is a different student — same first
    // syllables, different name, different profile — so the club confirmed
    // which of the two this is rather than the match being assumed.
    id: 'viswanathan-l',
    name: 'Viswanathan L',
    rank: 'senior-executive',
    role: 'Senior Design Executive',
    photo: '/images/m69.jpg',
    quote: 'Fuelled by curiosity, grounded in effort',
    linkedin: 'https://www.linkedin.com/in/viswanathan-l-159423384/',
  },
  {
    // Spelled as the club's own roster and his LinkedIn slug have it —
    // "Natrajan", not the "Natarajan" of the spoken instruction.
    id: 'kishore-natrajan',
    name: 'Kishore Natrajan',
    rank: 'senior-executive',
    role: 'Senior Videography Executive',
    photo: '/images/m23.jpg',
    quote: 'La pasión.',
    linkedin: 'https://www.linkedin.com/in/kishore-natrajan-569566331/',
    email: 'kishorenatrajan138@gmail.com',
  },
  {
    id: 'aadhithya-narayanan-a',
    name: 'Aadhithya Narayanan A',
    rank: 'senior-member',
    photo: '/images/m1.jpg',
    quote: 'No cap, just curiosity.',
    linkedin: 'https://www.linkedin.com/in/aadhithyanarayanan/',
  },
  {
    id: 'aadithya-r',
    name: 'Aadithya R',
    rank: 'senior-member',
    photo: '/images/m2.jpg',
    quote: 'To infinity and beyond.',
    linkedin: 'https://www.linkedin.com/in/aadithya-ark/',
  },
  {
    id: 'abayambal',
    name: 'Abayambal',
    rank: 'senior-member',
    photo: '/images/m3.jpg',
    quote: 'Engineer in the making, thinker by default',
    linkedin: 'https://www.linkedin.com/in/abayambal-duraisamy-813889326/',
  },
  {
    id: 'abhimanyu-singh-bhati',
    name: 'Abhimanyu Singh Bhati',
    rank: 'senior-member',
    photo: '/images/m4.jpg',
    quote: 'Easygoing person who loves stories, people, and experiences.',
    linkedin: 'https://www.linkedin.com/in/abhimanyu-singh-bhati-7255a0328/',
  },
  {
    id: 'abrar',
    name: 'Abrar',
    rank: 'senior-member',
    photo: '/images/m5.jpg',
    quote: "It's not Arrogance if I'm always right",
    linkedin: 'https://www.linkedin.com/in/abrar-a-3089ab327/',
  },
  {
    id: 'akshara-srivatsan',
    name: 'Akshara Srivatsan',
    rank: 'senior-member',
    photo: '/images/m6.jpg',
    quote: "Keeping ideas flowing and spirits high—that's my jam.",
    linkedin: 'https://www.linkedin.com/in/akshara-srivatsan-2791b5328/',
  },
  {
    id: 'ashwin-kumar',
    name: 'Ashwin Kumar',
    rank: 'senior-member',
    photo: '/images/m8.jpg',
    quote: 'A guy who is always ready to learn new things',
    linkedin: 'https://www.linkedin.com/in/t-r-ashwin-kumar-cse-8b1627327/',
  },
  {
    id: 'athmaja-g',
    name: 'Athmaja G',
    rank: 'senior-member',
    photo: '/images/m9.jpg',
    quote: 'I hate clouds that look like other clouds.',
    linkedin: 'https://www.linkedin.com/in/athmaja-gugan-42251631a/',
  },
  {
    id: 'barshana-rani-t',
    name: 'Barshana Rani T',
    rank: 'senior-member',
    photo: '/images/m10.jpg',
    quote: 'At the intersection of code and cells, I aspire to transform ideas into breakthroughs.',
    linkedin: 'https://www.linkedin.com/in/barshana-rani-thothathiri-013745321/',
  },
  {
    id: 'bhushika-r',
    name: 'Bhushika R',
    rank: 'senior-member',
    photo: '/images/m11.jpg',
    quote:
      'Someone who enjoys bringing ideas to life and quietly making a difference in every team I’m part of.',
    linkedin: 'https://www.linkedin.com/in/bhushika-rameshbabu-3791b4341/',
  },
  {
    id: 'devadharshini-sa',
    name: 'Devadharshini SA',
    rank: 'senior-member',
    photo: '/images/m12.jpg',
    quote: 'Designing Today , Defining Tomorrow',
    linkedin: 'https://www.linkedin.com/in/devadharshini-s-a-/',
  },
  {
    id: 'dharshika-sampathkumar',
    name: 'Dharshika Sampathkumar',
    rank: 'senior-member',
    photo: '/images/m13.jpg',
    quote: 'Driven by curiosity, powered by Passion.',
    linkedin: 'https://www.linkedin.com/in/dharshika-sampathkumar-52038a354/',
  },
  {
    id: 'divyashree-m',
    name: 'Divyashree M',
    rank: 'senior-member',
    photo: '/images/m14.jpg',
    quote:
      'I’m an optimistic person who loves coding, connecting with people, and making life wonderful.',
    linkedin: 'https://www.linkedin.com/in/divya-shree-m-09531631a/',
  },
  {
    id: 'guhan-kallapiran',
    name: 'Guhan Kallapiran',
    rank: 'senior-member',
    photo: '/images/m15.jpg',
    quote: 'Hesitation is defeat',
    linkedin: 'https://www.linkedin.com/in/guhan-kallapiran-613470286/',
  },
  {
    id: 'grisler-paul-j',
    name: 'Grisler Paul J',
    rank: 'senior-member',
    photo: '/images/m16.jpg',
    quote: 'Quiet moves,loud results',
    linkedin: 'https://www.linkedin.com/in/grisler-paul-033aa1330/',
  },
  {
    id: 'harini-k',
    name: 'Harini K',
    rank: 'senior-member',
    photo: '/images/m17.jpg',
    quote: 'Existence : loading…',
    linkedin: 'https://www.linkedin.com/in/harini-karthikeyan-2909302ba/',
  },
  {
    id: 'hirthik-mageshkumar',
    name: 'Hirthik Mageshkumar',
    rank: 'senior-member',
    photo: '/images/m18.jpg',
    quote: 'Focused on results with integrity',
    linkedin: 'https://www.linkedin.com/in/hirthik-mageshkumar',
  },
  {
    id: 'ilankavi-k',
    name: 'Ilankavi K',
    rank: 'senior-member',
    photo: '/images/m19.jpg',
    quote: 'Building my path, one step at a time.',
    linkedin: 'https://www.linkedin.com/in/ilankavi-kathiravan-5a8b851bb/',
  },
  {
    id: 'jashwanth-shankar-b',
    name: 'Jashwanth Shankar B',
    rank: 'senior-member',
    photo: '/images/m20.jpg',
    quote: 'Crafting simplicity with impact',
    linkedin: 'https://www.linkedin.com/in/b-jashwanth-shankar-791a27327/',
  },
  {
    id: 'kailash-s',
    name: 'Kailash S',
    rank: 'senior-member',
    photo: '/images/m21.jpg',
    quote: 'Be the change that you wish to see in the world',
    linkedin: 'https://www.linkedin.com/in/kailash-s-832501236/',
  },
  {
    id: 'mirthun-ks',
    name: 'Mirthun KS',
    rank: 'senior-member',
    photo: '/images/m26.jpg',
    quote: 'Carving out my path with love, grateful for the self I am becoming',
    linkedin: 'https://www.linkedin.com/in/mirthun-k-s-858b7a204',
  },
  {
    id: 'mohamed-shek-althaaf-f',
    name: 'Mohamed Shek Althaaf F',
    rank: 'senior-member',
    photo: '/images/m27.jpg',
    quote: 'Show up!!',
    linkedin: 'https://www.linkedin.com/in/mohamed-shek-althaaf-717b1b326/',
  },
  {
    id: 'mridula-sa',
    name: 'Mridula SA',
    rank: 'senior-member',
    photo: '/images/m28.jpg',
    quote: 'Just here',
    linkedin: 'https://www.linkedin.com/in/mridulasa/',
  },
  {
    id: 'nivethetha-v',
    name: 'Nivethetha V',
    rank: 'senior-member',
    photo: '/images/m30.jpg',
    quote: 'Strategic learner with a vision for impact.',
    linkedin: 'https://www.linkedin.com/in/nivethetha-v-51b032327/',
  },
  {
    id: 'praneet-g',
    name: 'Praneet G',
    rank: 'senior-member',
    photo: '/images/m33.jpg',
    quote:
      'I am passionate about solving problems in creative ways and love connecting with people to share ideas and inspire each other.',
    linkedin: 'https://www.linkedin.com/in/praneet-g-361b22385/',
  },
  {
    id: 'pravin-kumaar-ds',
    name: 'Pravin Kumaar DS',
    rank: 'senior-member',
    photo: '/images/m35.jpg',
    quote: 'I am an enthusiastic engineer',
    linkedin: 'https://www.linkedin.com/in/pravin-kumaar-d-s-587ba1359/',
  },
  {
    id: 'prithivikaa-d',
    name: 'Prithivikaa D',
    rank: 'senior-member',
    photo: '/images/m36.jpg',
    quote: 'Be Obsessed With Your Own Potential',
    linkedin: 'https://www.linkedin.com/in/prithivikaa-dharanipathi-b99584384/',
  },
  {
    id: 'sakthi-rasagnya-r',
    name: 'Sakthi Rasagnya R',
    rank: 'senior-member',
    photo: '/images/m38.jpg',
    quote: 'Fueled by passion, powered by joy.',
    linkedin: 'https://www.linkedin.com/in/r-sakthi-rasagnya-41b2b032a/',
  },
  {
    id: 'sam-joshua-s',
    name: 'Sam Joshua S',
    rank: 'senior-member',
    photo: '/images/m39.jpg',
    quote: 'You either die a hero, or you live long enough to see yourself become the villain.',
    linkedin: 'https://www.linkedin.com/in/sam-joshua-a0102a289/',
  },
  {
    id: 'sangavai-gk',
    name: 'Sangavai GK',
    rank: 'senior-member',
    photo: '/images/m40.jpg',
    quote: 'Wildcard',
    linkedin: 'https://www.linkedin.com/in/sangavai-g-k-ad-033514330/',
  },
  {
    id: 'sanjay-joshua',
    name: 'Sanjay Joshua',
    rank: 'senior-member',
    photo: '/images/m41.jpg',
    quote: 'My moto is simple Listen! Learn! Lead! .',
    linkedin: 'https://www.linkedin.com/in/sanjay-joshua-96a058331/',
  },
  {
    id: 'sanjay-srinivasan-b',
    name: 'Sanjay Srinivasan B',
    rank: 'senior-member',
    photo: '/images/m42.jpg',
    quote:
      'Aspiring ECE student and active Foresce Club member, driven to excel in placements and beyond.',
    linkedin: 'https://www.linkedin.com/in/sanjay-srinivasan-b-49a50a361/',
  },
  {
    id: 'sanjitha',
    name: 'Sanjitha',
    rank: 'senior-member',
    photo: '/images/m43.jpg',
    quote: 'Half chaos, half chill, half me!',
    linkedin: 'https://www.linkedin.com/in/sanjitha-ravishankar-b2143b319/',
  },
  {
    id: 'sarabesh-adithya-d',
    name: 'Sarabesh Adithya D',
    rank: 'senior-member',
    photo: '/images/m44.jpg',
    quote: 'Chasing The apex',
    linkedin: 'https://www.linkedin.com/in/sarabesh-adithya-d-966499329/',
  },
  {
    id: 'sathyakaman-ks',
    name: 'Sathyakaman KS',
    rank: 'senior-member',
    photo: '/images/m45.jpg',
    quote: 'I’d agree with you, but then we’d both be wrong.',
    linkedin: 'https://www.linkedin.com/in/sathyakaman-k-s-71a769327/',
  },
  {
    id: 'shaik-aadhil-s',
    name: 'Shaik Aadhil S',
    rank: 'senior-member',
    photo: '/images/m46.jpg',
    quote: 'Im not a business man. I am the business, man',
    linkedin: 'https://www.linkedin.com/in/shaik-aadhil-565469316/',
  },
  {
    id: 'shabreen-s',
    name: 'Shabreen S',
    rank: 'senior-member',
    photo: '/images/m47.jpg',
    quote: 'The most courageous act is to still think for yourself. Aloud.',
    linkedin: 'https://www.linkedin.com/in/shabreen-shajahan-7084b1327/',
  },
  {
    id: 'shamritha',
    name: 'Shamritha',
    rank: 'senior-member',
    photo: '/images/m48.jpg',
    quote: 'Too rare to relate , sarcasm solves all !',
    linkedin: 'https://www.linkedin.com/in/shamritha-s-87b635283/',
  },
  {
    id: 'shawn-abraham-joseph-l',
    name: 'Shawn Abraham Joseph L',
    rank: 'senior-member',
    photo: '/images/m49.jpg',
    quote: 'If you want to win the lottery, you have to make the money to buy the ticket.',
    linkedin: 'https://www.linkedin.com/in/shawn-abraham-joseph-3b2417329/',
  },
  {
    id: 'shobana-r',
    name: 'Shobana R',
    rank: 'senior-member',
    photo: '/images/m50.jpg',
    quote: 'Do not live someone else’s script. Write your own story',
    linkedin: 'https://www.linkedin.com/in/shobana-r-b15240334/',
  },
  {
    id: 'shree-vidhya-s',
    name: 'Shree Vidhya S',
    rank: 'senior-member',
    photo: '/images/m51.jpg',
    quote: 'I’m just a curious soul who enjoys figuring things out and having fun along the way.',
    linkedin: 'https://www.linkedin.com/in/shree-vidhya-somasundaram-2033ba327/',
  },
  {
    id: 'shreenidhi-c',
    name: 'Shreenidhi C',
    rank: 'senior-member',
    photo: '/images/m52.jpg',
    quote: 'Curious and passion-driven individual with a friendly demeanor.',
    linkedin: 'https://www.linkedin.com/in/shreenidhi-chandrasekaran-829400327/',
  },
  {
    id: 'sree-varshini-s',
    name: 'Sree Varshini S',
    rank: 'senior-member',
    photo: '/images/m54.jpg',
    quote: 'Low-key. On purpose.',
    linkedin: 'https://www.linkedin.com/in/sreevarshini-surendran-83ab56311/',
  },
  {
    id: 'srikanth-t',
    name: 'Srikanth T',
    rank: 'senior-member',
    photo: '/images/m55.jpg',
    quote: 'In my defence I was bored.',
    linkedin: 'https://www.linkedin.com/in/srikanth-thazhalan-881597338/',
  },
  {
    id: 'sai-harini-bs',
    name: 'Sai Harini BS',
    rank: 'senior-member',
    photo: '/images/m57.jpg',
    quote: 'Super poor kids with nothing but cool friends',
    linkedin: 'https://www.linkedin.com/in/sai-harini-suresh-7a090a357/',
  },
  {
    id: 'sowmiya-r',
    name: 'Sowmiya R',
    rank: 'senior-member',
    photo: '/images/m59.jpg',
    quote: 'Chasing growth, not perfection.',
    linkedin: 'https://www.linkedin.com/in/sowmiya-r-838058327/',
  },
  {
    id: 'tanish-s',
    name: 'Tanish S',
    rank: 'senior-member',
    photo: '/images/m60.jpg',
    quote: 'Curious, cooperative and everlearning.',
    linkedin: 'https://www.linkedin.com/in/tanish-s-121662327/',
  },
  {
    id: 'thanya-singh',
    name: 'Thanya Singh',
    rank: 'senior-member',
    photo: '/images/m61.jpg',
    quote: 'I ask questions like a pro , organize the answers like a perfectionist',
    linkedin: 'https://www.linkedin.com/in/thanya-singh-a07259328/',
  },
  {
    id: 'tharun-vel-k',
    name: 'Tharun Vel K',
    rank: 'senior-member',
    photo: '/images/m62.jpg',
    quote: 'Just a curious mind with a relaxed vibe',
    linkedin: 'https://www.linkedin.com/in/k-tharun-vel-4495a4338/',
  },
  {
    id: 'thirushan-sr',
    name: 'Thirushan SR',
    rank: 'senior-member',
    photo: '/images/m63.jpg',
    quote: 'Where creativity meets impact.',
    linkedin: 'https://www.linkedin.com/in/thirushan-s-r-a52532388/',
  },
  {
    id: 'vaishnavi-chitraa-m',
    name: 'Vaishnavi Chitraa M',
    rank: 'senior-member',
    photo: '/images/m64.jpg',
    quote: 'Peace in mind, Joy in heart',
    linkedin: 'https://www.linkedin.com/in/vaishnavi-chitraa-m-4226a1385/',
  },
  {
    id: 'vanishri',
    name: 'Vanishri',
    rank: 'senior-member',
    photo: '/images/m65.jpg',
    quote: 'I wonder freely, wander endlessly and shine fearlessly.',
    linkedin: 'https://www.linkedin.com/in/vani-shri-55575b327/',
  },
  {
    id: 'vanthana-r',
    name: 'Vanthana R',
    rank: 'senior-member',
    photo: '/images/m66.jpg',
    quote: "Shining among the star's within me",
    linkedin: 'https://www.linkedin.com/in/vanthana-raj',
  },
  {
    id: 'vikhashini-s',
    name: 'Vikhashini S',
    rank: 'senior-member',
    photo: '/images/m67.jpg',
    quote: 'Don’t chase the spotlight—be the reason it exists.',
    linkedin: 'https://www.linkedin.com/in/vikhashini-s-2a8295328/',
  },
  {
    id: 'vishwanth-cr',
    name: 'Vishwanth CR',
    rank: 'senior-member',
    photo: '/images/m68.jpg',
    quote: 'Just a coder chasing speed, dreams, and greatness',
    linkedin: 'https://www.linkedin.com/in/vishwanth-c-r-097497327/',
  },
  {
    id: 'yadhunandhan-k',
    name: 'Yadhunandhan K',
    rank: 'senior-member',
    photo: '/images/m70.jpg',
    quote: 'Focused and resilient Engineer in the making.',
    linkedin: 'https://www.linkedin.com/in/yadhunandhan19/',
  },
  {
    id: 'a-ashetha-raj',
    name: 'A Ashetha Raj',
    rank: 'member',
    photo: '/images/members/a-ashetha-raj.jpg',
  },
  {
    id: 'a-mahathi-kavya',
    name: 'A Mahathi Kavya',
    rank: 'member',
    photo: '/images/members/a-mahathi-kavya.jpg',
  },
  {
    id: 'a-mathimalar',
    name: 'A Mathimalar',
    rank: 'member',
    photo: '/images/members/a-mathimalar.jpg',
  },
  {
    id: 'abdul-muhaiman-basha',
    name: 'Abdul Muhaiman Basha',
    rank: 'member',
    photo: '/images/members/abdul-muhaiman-basha.jpg',
  },
  {
    id: 'akshaya-murugan',
    name: 'Akhshaya Murugan',
    rank: 'member',
    photo: '/images/members/akshaya-murugan.jpg',
  },
  {
    id: 'akshara-s',
    name: 'Akshara S',
    rank: 'member',
    photo: '/images/members/akshara-s.jpg',
  },
  {
    id: 'alahari-ananya',
    name: 'Alahari Ananya',
    rank: 'member',
    photo: '/images/members/alahari-ananya.jpg',
  },
  {
    id: 'anandhakannan-m-j',
    name: 'Anandhakannan M J',
    rank: 'member',
    photo: '/images/members/anandhakannan-m-j.jpg',
  },
  {
    id: 'anupriya-d',
    name: 'Anupriya D',
    rank: 'member',
    photo: '/images/members/anupriya-d.jpg',
  },
  {
    id: 'apparna-a',
    name: 'Apparna A',
    rank: 'member',
    photo: '/images/members/apparna-a.jpg',
  },
  {
    id: 'bala-aravinthan-g',
    name: 'Bala Aravinthan G',
    rank: 'member',
    photo: '/images/members/bala-aravinthan-g.jpg',
  },
  {
    id: 'balaji-b',
    name: 'Balaji B',
    rank: 'member',
    photo: '/images/members/balaji-b.jpg',
  },
  {
    id: 'bhavana',
    name: 'Bhavana',
    rank: 'member',
    photo: '/images/members/bhavana.jpg',
  },
  {
    id: 'chamitha-s',
    name: 'Chamitha S',
    rank: 'member',
    photo: '/images/members/chamitha-s.jpg',
  },
  {
    id: 'd-anirrudh',
    name: 'D Anirrudh',
    rank: 'member',
    photo: '/images/members/d-anirrudh.jpg',
  },
  {
    id: 'daahir-khaderali-rabideen',
    name: 'Daahir Khaderali Rabideen',
    rank: 'member',
    photo: '/images/members/daahir-khaderali-rabideen.jpg',
  },
  {
    id: 'devalakshitha-n',
    name: 'Devalakshitha N',
    rank: 'member',
    photo: '/images/members/devalakshitha-n.jpg',
  },
  {
    id: 'dhanyatha-r',
    name: 'Dhanyatha R',
    rank: 'member',
    photo: '/images/members/dhanyatha-r.jpg',
  },
  {
    id: 'g-chittesh-raj',
    name: 'G Chittesh Raj',
    rank: 'member',
    photo: '/images/members/g-chittesh-raj.jpg',
  },
  {
    id: 'g-mathav-karthik',
    name: 'G Mathav Karthik',
    rank: 'member',
    photo: '/images/members/g-mathav-karthik.jpg',
  },
  {
    id: 'gayatri-v',
    name: 'Gayatri V',
    rank: 'member',
    photo: '/images/members/gayatri-v.jpg',
  },
  {
    id: 'harini-sharon-r-i',
    name: 'Harini Sharon R I',
    rank: 'member',
    photo: '/images/members/harini-sharon-r-i.jpg',
  },
  {
    id: 'harshitha-h',
    name: 'Harshitha H',
    rank: 'member',
    photo: '/images/members/harshitha-h.jpg',
  },
  {
    id: 'harshitha-r',
    name: 'Harshitha R',
    rank: 'member',
    photo: '/images/members/harshitha-r.jpg',
  },
  {
    id: 'indhuja-s',
    name: 'Indhuja S',
    rank: 'member',
    photo: '/images/members/indhuja-s.jpg',
  },
  {
    id: 'jagabattula-subhash-tapasvi',
    name: 'Jagabattula Subhash Tapasvi',
    rank: 'member',
    photo: '/images/members/jagabattula-subhash-tapasvi.jpg',
  },
  {
    id: 'jandhyala-amrutha-sree-hasini',
    name: 'Jandhyala Amrutha Sree Hasini',
    rank: 'member',
    photo: '/images/members/jandhyala-amrutha-sree-hasini.jpg',
  },
  {
    id: 'jovial-jayburt-paravallapil',
    name: 'Jovial Jayburt Paravallapil',
    rank: 'member',
    photo: '/images/members/jovial-jayburt-paravallapil.jpg',
  },
  {
    id: 'k-jaideep',
    name: 'K Jaideep',
    rank: 'member',
    photo: '/images/members/k-jaideep.jpg',
  },
  {
    id: 'k-mukesh',
    name: 'K Mukesh',
    rank: 'member',
    photo: '/images/members/k-mukesh.jpg',
  },
  {
    id: 'kaaviya-nagarajan',
    name: 'Kaaviya Nagarajan',
    rank: 'member',
    photo: '/images/members/kaaviya-nagarajan.jpg',
  },
  {
    id: 'kaushik-sathya-praksh',
    name: 'Kaushik Sathya Praksh',
    rank: 'member',
    photo: '/images/members/kaushik-sathya-praksh.jpg',
  },
  {
    id: 'kavin-kumar-s',
    name: 'Kavin Kumar S',
    rank: 'member',
    photo: '/images/members/kavin-kumar-s.jpg',
  },
  {
    id: 'kavin-srinivass-i-k',
    name: 'Kavin Srinivass I K',
    rank: 'member',
    photo: '/images/members/kavin-srinivass-i-k.jpg',
  },
  {
    id: 'kiranraj-m',
    name: 'Kiranraj M',
    rank: 'member',
    photo: '/images/members/kiranraj-m.jpg',
  },
  {
    id: 'krishna-b',
    name: 'Krishna B',
    rank: 'member',
    photo: '/images/members/krishna-b.jpg',
  },
  {
    id: 'krishna-datta-adibatla-v',
    name: 'Krishna Datta Adibatla V',
    rank: 'member',
    photo: '/images/members/krishna-datta-adibatla-v.jpg',
  },
  {
    id: 'm-titiksha',
    name: 'M Titiksha',
    rank: 'member',
    photo: '/images/members/m-titiksha.jpg',
  },
  {
    id: 'madhushalani-s',
    name: 'Madhushalani S',
    rank: 'member',
    photo: '/images/members/madhushalani-s.jpg',
  },
  {
    id: 'nethra-ravichandran',
    name: 'Nethra Ravichandran',
    rank: 'member',
    photo: '/images/members/nethra-ravichandran.jpg',
  },
  {
    id: 'netraa-k',
    name: 'Netraa K',
    rank: 'member',
    photo: '/images/members/netraa-k.jpg',
  },
  {
    id: 'nitharshana-s',
    name: 'Nitharshana S',
    rank: 'member',
    photo: '/images/members/nitharshana-s.jpg',
  },
  {
    id: 'p-a-olive-ashrita',
    name: 'P A Olive Ashrita',
    rank: 'member',
    photo: '/images/members/p-a-olive-ashrita.jpg',
  },
  {
    id: 'p-yeswanth',
    name: 'P Yeswanth',
    rank: 'member',
    photo: '/images/members/p-yeswanth.jpg',
  },
  {
    id: 'p-ashwant',
    name: 'P. Ashwant',
    rank: 'member',
    photo: '/images/members/p-ashwant.jpg',
  },
  {
    id: 'pragatheeshwaran-s',
    name: 'Pragatheeshwaran S',
    rank: 'member',
    photo: '/images/members/pragatheeshwaran-s.jpg',
  },
  {
    id: 'pranav-a',
    name: 'Pranav A',
    rank: 'member',
    photo: '/images/members/pranav-a.jpg',
  },
  {
    id: 'pranav-karthick-v',
    name: 'Pranav Karthick V',
    rank: 'member',
    photo: '/images/members/pranav-karthick-v.jpg',
  },
  {
    id: 'prithika-balaji',
    name: 'Prithika Balaji',
    rank: 'member',
    photo: '/images/members/prithika-balaji.jpg',
  },
  {
    id: 'prithish-a-s',
    name: 'Prithish A S',
    rank: 'member',
    photo: '/images/members/prithish-a-s.jpg',
  },
  {
    id: 'priyan-b',
    name: 'Priyan B',
    rank: 'member',
    photo: '/images/members/priyan-b.jpg',
  },
  {
    id: 'puligilla-sai-vignesh',
    name: 'Puligilla Sai Vignesh',
    rank: 'member',
    photo: '/images/members/puligilla-sai-vignesh.jpg',
  },
  {
    id: 'r-devesh',
    name: 'R Devesh',
    rank: 'member',
    photo: '/images/members/r-devesh.jpg',
  },
  {
    id: 'r-lekshita-pranavi',
    name: 'R. Lekshita Pranavi',
    rank: 'member',
    photo: '/images/members/r-lekshita-pranavi.jpg',
  },
  {
    id: 'ram-balajee-p',
    name: 'Ram Balajee P',
    rank: 'member',
    photo: '/images/members/ram-balajee-p.jpg',
  },
  {
    id: 'rishi-varma',
    name: 'Rishi Varma',
    rank: 'member',
    photo: '/images/members/rishi-varma.jpg',
  },
  {
    id: 'rithik-eashwar-g',
    name: 'Rithik Eashwar G',
    rank: 'member',
    photo: '/images/members/rithik-eashwar-g.jpg',
  },
  {
    id: 'rohith-kumaar-p-r',
    name: 'Rohith Kumaar P R',
    rank: 'member',
    photo: '/images/members/rohith-kumaar-p-r.jpg',
  },
  {
    id: 's-ananthika',
    name: 'S Ananthika',
    rank: 'member',
    photo: '/images/members/s-ananthika.jpg',
  },
  {
    id: 's-k-sreenidhi',
    name: 'S K Sreenidhi',
    rank: 'member',
    photo: '/images/members/s-k-sreenidhi.jpg',
  },
  {
    id: 's-kowshik-ganesh',
    name: 'S Kowshik Ganesh',
    rank: 'member',
    photo: '/images/members/s-kowshik-ganesh.jpg',
  },
  {
    id: 's-reya',
    name: 'S Reya',
    rank: 'member',
    photo: '/images/members/s-reya.jpg',
  },
  {
    id: 's-s-lokhith',
    name: 'S S Lokhith',
    rank: 'member',
    photo: '/images/members/s-s-lokhith.jpg',
  },
  {
    id: 'sabiya-m',
    name: 'Sabiya M',
    rank: 'member',
    photo: '/images/members/sabiya-m.jpg',
  },
  {
    id: 'sahana-srinat',
    name: 'Sahana Srinat',
    rank: 'member',
    photo: '/images/members/sahana-srinat.jpg',
  },
  {
    id: 'sai-hari-r',
    name: 'Sai Hari R',
    rank: 'member',
    photo: '/images/members/sai-hari-r.jpg',
  },
  {
    id: 'sampreethi-s',
    name: 'Sampreethi S',
    rank: 'member',
    photo: '/images/members/sampreethi-s.jpg',
  },
  {
    id: 'saranya-s',
    name: 'Saranya S',
    rank: 'member',
    photo: '/images/members/saranya-s.jpg',
  },
  {
    id: 'sharan-suresh',
    name: 'Sharan Suresh',
    rank: 'member',
    photo: '/images/members/sharan-suresh.jpg',
  },
  {
    id: 'shivani-shri-r-d',
    name: 'Shivani Shri R D',
    rank: 'member',
    photo: '/images/members/shivani-shri-r-d.jpg',
  },
  {
    id: 'sooraj-d',
    name: 'Sooraj D',
    rank: 'member',
    photo: '/images/members/sooraj-d.jpg',
  },
  {
    id: 'sri-varsha-s',
    name: 'Sri Varsha S',
    rank: 'member',
    photo: '/images/members/sri-varsha-s.jpg',
  },
  {
    id: 'sriharini-s',
    name: 'Sriharini S',
    rank: 'member',
    photo: '/images/members/sriharini-s.jpg',
  },
  {
    id: 'stefeena-g-p',
    name: 'Stefeena G P',
    rank: 'member',
    photo: '/images/members/stefeena-g-p.jpg',
  },
  {
    id: 'subhaashini-a',
    name: 'Subhaashini A',
    rank: 'member',
    photo: '/images/members/subhaashini-a.jpg',
  },
  {
    id: 'surya-narayanan-m-v',
    name: 'Surya Narayanan M V',
    rank: 'member',
    photo: '/images/members/surya-narayanan-m-v.jpg',
  },
  {
    id: 'surya-s',
    name: 'Surya S',
    rank: 'member',
    photo: '/images/members/surya-s.jpg',
  },
  {
    id: 'thamizhanban-v',
    name: 'Thamizhanban V',
    rank: 'member',
    photo: '/images/members/thamizhanban-v.jpg',
  },
  {
    id: 'thangaraja-d',
    name: 'Thangaraja D',
    rank: 'member',
    photo: '/images/members/thangaraja-d.jpg',
  },
  {
    id: 'thejesh-ramesh',
    name: 'Thejesh Ramesh',
    rank: 'member',
    photo: '/images/members/thejesh-ramesh.jpg',
  },
  {
    id: 'v-modhini',
    name: 'V Modhini',
    rank: 'member',
    photo: '/images/members/v-modhini.jpg',
  },
  {
    id: 'vishwanathan-k',
    name: 'Vishwanathan K',
    rank: 'member',
    photo: '/images/members/vishwanathan-k.jpg',
  },
  {
    id: 'yaathra-p',
    name: 'Yaathra P',
    rank: 'member',
    photo: '/images/members/yaathra-p.jpg',
  },
  {
    id: 'yashitha-v',
    name: 'Yashitha V',
    rank: 'member',
    photo: '/images/members/yashitha-v.jpg',
  },
];
