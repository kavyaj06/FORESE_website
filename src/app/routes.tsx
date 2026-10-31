import { lazy, Suspense, type ComponentType } from 'react';
import { matchPath, type Params } from 'react-router-dom';

import HomePage from '@/pages/home/HomePage';
import MockPlacementsPage from '@/pages/mock-placements/MockPlacementsPage';
import TipsPage from '@/pages/tips/TipsPage';
import { findTopic } from '@/pages/tips/data';
import EventsPage from '@/pages/events/EventsPage';
import EventPage from '@/pages/events/EventPage';
import TeamPage from '@/pages/team/TeamPage';
import GalleryPage from '@/pages/gallery/GalleryPage';
import AlbumPage from '@/pages/gallery/AlbumPage';
import { findEventBySlug } from '@/data/events';
// News is commented out across the site at the club's request, not deleted:
// the page and its content still exist, and uncommenting this import and the
// route below is the whole of putting it back. Everything else — the nav bar,
// the footer's Quick links, the sitemap — reads the route table, so removing
// the entry removes the page from all of them at once.
// import NewsPage from '@/pages/news/NewsPage';

/**
 * The club's editing screen, and the one page that is not bundled with the
 * rest of the site.
 *
 * It pulls in the Firebase SDK, which is far larger than any page here and is
 * of no use to a visitor: lazy means that weight is downloaded by the handful
 * of people who open `/admin` and by nobody else. Everything on the public
 * site reads its content over plain REST instead — see `@/data/remote`.
 */
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'));

function AdminRoute() {
  return (
    <Suspense fallback={null}>
      <AdminPage />
    </Suspense>
  );
}
import StyleguidePage from '@/pages/styleguide/StyleguidePage';

/**
 * ============================================================================
 * THE ROUTE TABLE — single source of truth
 * ----------------------------------------------------------------------------
 * The router, the navbar, the mobile drawer, the footer link columns and the
 * per-page <title>/meta tags are all derived from this array.
 *
 * Adding a page to the site means adding one entry here. There is no second
 * place to remember.
 *
 * Order matches the navigation order in the Canva outline:
 *   Forese | Mock Placements  Events  Team  Gallery | Coders
 * ==========================================================================*/

/** Footer column a route appears under. Omit to keep it out of the footer. */
export type FooterGroup = 'quickLinks';

/**
 * Page metadata that can depend on the URL.
 *
 * A function for routes whose title comes from their content — the gallery
 * album page is "Mock Placement Drive 2025", not "Album". Keeping this in the
 * route table rather than letting the page set its own title preserves the
 * single source of truth: React runs child effects before parent effects, so
 * a page setting its own document title would be overwritten by the layout
 * moments later.
 */
export type RouteMeta = string | ((params: Params<string>) => string);

export interface AppRoute {
  /** URL path. */
  path: string;
  /** Short label for navigation. Matches the outline's wording. */
  label: string;
  /** The page component. */
  Component: ComponentType;
  /** Document title. The site name is appended automatically. */
  title: RouteMeta;
  /** Meta description for this page. */
  description: RouteMeta;
  /** Show in the primary navbar and mobile drawer. */
  inPrimaryNav: boolean;
  /** Which footer column, if any. */
  footerGroup?: FooterGroup;
  /** Hidden from all navigation and excluded from production builds. */
  devOnly?: boolean;
}

const ALL_ROUTES: AppRoute[] = [
  {
    path: '/',
    label: 'Home',
    Component: HomePage,
    title: 'FORESE',
    description: 'The official website of the FORESE Club.',
    // The wordmark links home, so Home is not repeated as a nav link.
    inPrimaryNav: false,
    footerGroup: 'quickLinks',
  },
  {
    path: '/mocks',
    label: 'Mock Placements',
    Component: MockPlacementsPage,
    title: 'Mock Placements',
    description: 'The FORESE mock placement process, from contact collection to mock interviews.',
    inPrimaryNav: true,
    footerGroup: 'quickLinks',
  },
  {
    /**
     * The guides are three pages, not three sections of one — see the note in
     * `TipsPage`. This entry is the one the navigation points at, and it
     * redirects to the first of them, so there is a single address for "the
     * tips" and a single canonical URL for each guide underneath it.
     */
    path: '/tips',
    label: 'Interview Tips',
    Component: TipsPage,
    title: 'Interview Tips',
    description:
      'Group discussion, aptitude and resume guidance from FORESE, for students preparing for placements.',
    inPrimaryNav: true,
    footerGroup: 'quickLinks',
  },
  {
    // One guide. Not in any navigation — the rail at the top of each guide is
    // how a reader moves between them — but a real URL, which is the point:
    // a student can be sent to the resume advice rather than to the top of
    // all three.
    path: '/tips/:topic',
    label: 'Interview Tips',
    Component: TipsPage,
    title: (params) => findTopic(params.topic)?.title ?? 'Interview Tips',
    description: (params) =>
      findTopic(params.topic)?.blurb ??
      'Group discussion, aptitude and resume guidance from FORESE, for students preparing for placements.',
    inPrimaryNav: false,
  },
  {
    path: '/events',
    label: 'Events',
    Component: EventsPage,
    title: 'Events',
    description: 'Upcoming and completed FORESE Club events.',
    inPrimaryNav: true,
    footerGroup: 'quickLinks',
  },
  {
    // One event. Not in any navigation — it is reached from the list — but a
    // real URL, which is the point: the club sends these to students, and
    // "read about FORED" should be a link to FORED.
    path: '/events/:slug',
    label: 'Event',
    Component: EventPage,
    title: (params) => (params.slug ? (findEventBySlug(params.slug)?.name ?? 'Event') : 'Event'),
    description: (params) => {
      const event = params.slug ? findEventBySlug(params.slug) : undefined;
      return event?.tagline ?? event?.blurb ?? 'A FORESE event.';
    },
    inPrimaryNav: false,
  },
  {
    path: '/team',
    label: 'Team',
    Component: TeamPage,
    title: 'Team',
    description: 'The senior and junior members behind the FORESE Club.',
    inPrimaryNav: true,
    footerGroup: 'quickLinks',
  },
  {
    path: '/gallery',
    label: 'Gallery',
    Component: GalleryPage,
    title: 'Gallery',
    description: 'Event-wise photograph gallery from FORESE Club events.',
    inPrimaryNav: true,
    footerGroup: 'quickLinks',
  },
  {
    // One album. Not in any navigation — it is reached from the gallery index,
    // but it is a real URL so a single event's photographs can be shared.
    path: '/gallery/:slug',
    label: 'Album',
    Component: AlbumPage,
    title: (params) => (params.slug ? (findEventBySlug(params.slug)?.name ?? 'Album') : 'Album'),
    description: (params) =>
      params.slug
        ? `Photographs from ${findEventBySlug(params.slug)?.name ?? 'a FORESE event'}.`
        : 'Photographs from a FORESE event.',
    inPrimaryNav: false,
  },
  // {
  //   path: '/news',
  //   label: 'News',
  //   Component: NewsPage,
  //   title: 'News',
  //   description: 'The FORESE newsletter and news updates.',
  //   inPrimaryNav: true,
  //   footerGroup: 'quickLinks',
  // },
  {
    /**
     * Reached from the copyright line in the footer and from nowhere else: no
     * navigation, no footer column, no sitemap, and `noindex` once it loads.
     *
     * Not `devOnly` — the whole point is that the club can edit the live site.
     * And obscurity is not what protects it: the Firestore rules are. See the
     * doc-block in `AdminPage`.
     */
    path: '/admin',
    label: 'Club editor',
    Component: AdminRoute,
    title: 'Club editor',
    description: 'Private editing screen for the FORESE club.',
    inPrimaryNav: false,
  },
  {
    // Renders every design token and component on one page so the system can
    // be compared side by side against the reference designs.
    path: '/styleguide',
    label: 'Styleguide',
    Component: StyleguidePage,
    title: 'Styleguide',
    description: 'Internal design system reference.',
    inPrimaryNav: false,
    devOnly: true,
  },
];

/** Routes active in the current build. Dev-only routes are dropped in production. */
export const ROUTES: AppRoute[] = ALL_ROUTES.filter(
  (route) => !route.devOnly || import.meta.env.DEV,
);

/** Plain links in the centre of the navbar. */
export const PRIMARY_NAV: AppRoute[] = ROUTES.filter((route) => route.inPrimaryNav);

/** Every page shown in the mobile drawer. The action below is added after them. */
export const MOBILE_NAV: AppRoute[] = PRIMARY_NAV;

/**
 * The highlighted destination at the right of the navbar.
 *
 * Not a route, and that is the point: the Coders' Forum is a site of its own,
 * at its own address. It used to be an entry in the table above with a
 * placeholder page behind it, which meant the bar pointed at a screen saying
 * the page had not been scoped yet. Modelling it as what it is — a link
 * somewhere else — is what lets the navbar open it in a new tab and mark it up
 * as external, and it is why the route table has no `/coders` any more.
 *
 * The outline shows exactly one of these, so it is a constant rather than a
 * list. A second one would be a list, and a different conversation about what
 * the bar is for.
 */
export interface NavAction {
  label: string;
  href: string;
}

export const NAV_ACTION: NavAction = {
  label: 'Coders',
  href: 'https://coders-forum.vercel.app/',
};

/** Routes belonging to a given footer column. */
export function footerRoutes(group: FooterGroup): AppRoute[] {
  return ROUTES.filter((route) => route.footerGroup === group);
}

/**
 * Resolve a pathname to its route and URL parameters.
 *
 * Uses the router's own matcher rather than string equality, so parameterised
 * paths like `/gallery/:slug` resolve. Static routes are checked first: a
 * literal path must never be captured by a pattern that happens to also match.
 */
export function findRoute(
  pathname: string,
): { route: AppRoute; params: Params<string> } | undefined {
  const isDynamic = (route: AppRoute) => route.path.includes(':');

  for (const route of [...ROUTES.filter((r) => !isDynamic(r)), ...ROUTES.filter(isDynamic)]) {
    const match = matchPath(route.path, pathname);
    if (match) return { route, params: match.params };
  }

  return undefined;
}

/** Title and description for a pathname, with any parameters applied. */
export function resolveRouteMeta(pathname: string): { title?: string; description?: string } {
  const found = findRoute(pathname);
  if (!found) return {};

  const resolve = (value: RouteMeta) => (typeof value === 'function' ? value(found.params) : value);

  return {
    title: resolve(found.route.title),
    description: resolve(found.route.description),
  };
}
