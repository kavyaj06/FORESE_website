/**
 * Gallery — page content.
 *
 * Photographs are grouped under the shared event list in `@/data/events.ts`;
 * this file only says which pictures belong to which event.
 *
 * ⚠️ AWAITING PHOTOGRAPHS. Every entry below has its dimensions but no `src`,
 * so tiles render as placeholders that hold the exact shape the real picture
 * will occupy. Adding a photograph is one field:
 *
 *   1. Drop the file in `public/gallery/<event-slug>/`
 *   2. Set `src: '/gallery/<event-slug>/<file>.webp'`
 *   3. Put the real `width`/`height` in, and write a real `alt`
 *
 * `width` and `height` are required even before the file exists. They reserve
 * the tile's box, which is what stops the whole grid reflowing as pictures
 * arrive — the single biggest cause of layout shift on a gallery page.
 */

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
    spreadsheet. These stand in until the real photographs land. */
const PLACEHOLDER_SHAPES: Array<[number, number]> = [
  [1600, 1067],
  [1200, 1600],
  [1600, 1067],
  [1500, 1500],
  [1600, 900],
  [1200, 1600],
  [1600, 1067],
  [1500, 1500],
  [1600, 1067],
];

function placeholderPhotos(eventId: string, count: number): GalleryPhoto[] {
  return Array.from({ length: count }, (_, index) => {
    const [width, height] = PLACEHOLDER_SHAPES[index % PLACEHOLDER_SHAPES.length];
    return {
      id: `${eventId}-${index + 1}`,
      width,
      height,
      alt: `Photograph ${index + 1} — awaiting upload`,
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
