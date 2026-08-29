/**
 * Gallery — page content.
 *
 * Photographs are grouped under the shared event list in `@/data/events.ts`;
 * this file only says which pictures belong to which event.
 *
 * ⚠️ DUMMY IMAGES IN PLACE. `public/gallery/` currently holds generated
 * abstracts so the layout, motion and lightbox can be judged against real
 * image files. To swap in the club's photographs:
 *
 *   1. Replace the files in `public/gallery/<event-slug>/`
 *   2. Put each photograph's true `width`/`height` in
 *   3. Write a real `alt` describing what the picture shows
 *
 * `width` and `height` are required even before the file exists. They reserve
 * the tile's box, which is what stops the whole grid reflowing as pictures
 * arrive — the single biggest cause of layout shift on a gallery page.
 */

import { EVENTS_BY_RECENCY, type ForeseEvent } from '@/data/events';

/**
 * How many of the newest events get the large image-led treatment before the
 * rest fall back to the compact archive list.
 *
 * The index has to work at both ends: with four events a bare list is an
 * almost empty page, and with sixty a wall of cover cards is unnavigable.
 * Three featured plus an archive is good at four events and still good at
 * sixty.
 */
export const FEATURED_COUNT = 3;

export const GALLERY_INTRO = {
  eyebrow: 'Gallery',
  title: 'Every event, as it happened',
  description:
    'Photographs from the drives, lectures and sessions the club has run, grouped by event and newest first.',
} as const;

export interface GalleryPhoto {
  id: string;
  /** Path under `public/`. Absent until the photograph is supplied. */
  src?: string;
  /** Intrinsic pixel size. Required — it reserves the tile's box. */
  width: number;
  height: number;
  /**
   * What the photograph shows. Read by screen readers and shown as the
   * lightbox caption, so write it as a description, not a file name.
   */
  alt: string;
}

export interface GalleryAlbum {
  /** References an id in `@/data/events.ts`. */
  eventId: string;
  photos: GalleryPhoto[];
}

/** Varied shapes on purpose — a masonry grid of identical rectangles is a
    spreadsheet. Matches the dummy files currently in `public/gallery/`. */
const PLACEHOLDER_SHAPES: Array<[number, number]> = [
  [1100, 733],
  [825, 1100],
  [1100, 733],
  [1100, 1100],
  [1100, 619],
  [825, 1100],
  [1100, 733],
  [1100, 1100],
  [1100, 733],
];

/**
 * ⚠️ DUMMY IMAGES. `public/gallery/<slug>/NN.jpg` are generated abstracts, not
 * photographs, so the layout can be judged against real files. Replace the
 * folder contents and the `alt` text below; the shape table above then needs
 * updating to each real photograph's true dimensions.
 */
function placeholderPhotos(slug: string, count: number): GalleryPhoto[] {
  return Array.from({ length: count }, (_, index) => {
    const [width, height] = PLACEHOLDER_SHAPES[index % PLACEHOLDER_SHAPES.length];
    return {
      id: `${slug}-${index + 1}`,
      src: `/gallery/${slug}/${String(index + 1).padStart(2, '0')}.jpg`,
      width,
      height,
      alt: `Placeholder image ${index + 1}`,
    };
  });
}

export const GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    eventId: 'mock-placement-drive-2025',
    photos: placeholderPhotos('mock-placement-drive-2025', 9),
  },
  { eventId: 'corporate-connect-2025', photos: placeholderPhotos('corporate-connect-2025', 6) },
  {
    eventId: 'guest-lecture-series-2025',
    photos: placeholderPhotos('guest-lecture-series-2025', 7),
  },
  { eventId: 'orientation-2025', photos: placeholderPhotos('orientation-2025', 5) },
];

/**
 * One event as the index presents it. Computed once here rather than
 * assembled independently by the featured grid and the archive list, so the
 * two can never disagree about an event's cover or photo count.
 */
export interface GalleryIndexEntry {
  event: ForeseEvent;
  cover?: GalleryPhoto;
  photoCount: number;
}

/**
 * Every event that actually has photographs, newest first.
 *
 * An event with an empty album is dropped rather than shown as an empty card:
 * a gallery entry that leads nowhere is worse than no entry.
 */
export function galleryIndexEntries(): GalleryIndexEntry[] {
  return EVENTS_BY_RECENCY.map((event) => {
    const photos = albumFor(event.id)?.photos ?? [];
    return { event, cover: photos[0], photoCount: photos.length };
  }).filter((entry) => entry.photoCount > 0);
}

/** The album for an event id, if it has one. */
export function albumFor(eventId: string): GalleryAlbum | undefined {
  return GALLERY_ALBUMS.find((album) => album.eventId === eventId);
}

/** The photograph that represents an event in the index. */
export function coverPhoto(eventId: string): GalleryPhoto | undefined {
  return albumFor(eventId)?.photos[0];
}
