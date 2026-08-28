import type { ComponentType } from 'react';
import { matchPath, type Params } from 'react-router-dom';

import HomePage from '@/pages/home/HomePage';
import MockPlacementsPage from '@/pages/mock-placements/MockPlacementsPage';
import EventsPage from '@/pages/events/EventsPage';
import TeamPage from '@/pages/team/TeamPage';
import GalleryPage from '@/pages/gallery/GalleryPage';
import AlbumPage from '@/pages/gallery/AlbumPage';
import { findEventBySlug } from '@/data/events';
import NewsPage from '@/pages/news/NewsPage';
import CodersPage from '@/pages/coders/CodersPage';
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
 *   Forese | Mocks  Events  Team  Gallery  News | Coders
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
  /**
   * Render as the highlighted action at the right of the navbar rather than
   * as a plain link. The outline shows exactly one of these: Coders.
   */
  isNavAction?: boolean;
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
    label: 'Mocks',
    Component: MockPlacementsPage,
    title: 'Mock Placement',
    description: 'The FORESE mock placement process, from contact collection to mock interviews.',
    inPrimaryNav: true,
    footerGroup: 'quickLinks',
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
  {
    path: '/news',
    label: 'News',
    Component: NewsPage,
    title: 'News',
    description: 'The FORESE newsletter and news updates.',
    inPrimaryNav: true,
    footerGroup: 'quickLinks',
  },
  {
    path: '/coders',
    label: 'Coders',
    Component: CodersPage,
    title: 'Coders',
    description: "The FORESE Coders' Forum.",
    inPrimaryNav: true,
    isNavAction: true,
    footerGroup: 'quickLinks',
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
export const PRIMARY_NAV: AppRoute[] = ROUTES.filter(
  (route) => route.inPrimaryNav && !route.isNavAction,
);

/** The highlighted action at the right of the navbar, if any. */
export const NAV_ACTION: AppRoute | undefined = ROUTES.find((route) => route.isNavAction);

/** Every destination shown in the mobile drawer, action included. */
export const MOBILE_NAV: AppRoute[] = ROUTES.filter((route) => route.inPrimaryNav);

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
