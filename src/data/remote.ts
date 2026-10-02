import type { ForeseEvent } from './events';
import type { GalleryAlbum, GalleryPhoto } from '@/pages/gallery/data';

/**
 * The club's own content, read from Firestore at boot.
 *
 * ============================================================================
 * WHY THIS IS A MODULE-LEVEL STORE AND NOT A HOOK
 * ----------------------------------------------------------------------------
 * Half this site reads its content at *module scope*: `EventWorkflow.tsx`
 * builds its three workflows the moment it is imported, `routes.tsx` resolves
 * an album's page title from the event list, and three more files call
 * `circulatingPhotos()` while rendering. Making the content async would mean
 * rewriting every one of them.
 *
 * It does not have to be async. Every page module is reached through `App`, so
 * `main.tsx` loads this *before* it imports `App` — the two in parallel, so
 * nothing is serialised — and by the time any page module evaluates, the store
 * is already full. `events.ts` and the gallery's `data.ts` simply read it:
 *
 *     export const EVENTS = remoteEvents() ?? SEED_EVENTS;
 *
 * Nothing downstream knows this file exists.
 *
 * **The site still works with no network and no Firebase project.** Both
 * getters return `null` until a load succeeds, and both callers fall back to
 * the content written in the source — which is what the site shipped with and
 * what it renders offline, on a failed fetch, or before anyone has configured
 * a project at all.
 *
 * **REST, not the SDK.** A `fetch` costs nothing in the bundle. Pulling in
 * `firebase/firestore` for two reads would put ~100KB of SDK in front of every
 * visitor to a page that only ever reads. The SDK is loaded by the admin page
 * alone, which is the only thing that writes.
 * ==========================================================================*/

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

/**
 * How long the site waits for its content before giving up and rendering what
 * it was built with.
 *
 * Short on purpose. This sits in front of the first paint, and a visitor on a
 * bad connection is better served by last term's events arriving instantly
 * than by this term's arriving after a blank five seconds.
 */
const TIMEOUT_MS = 2000;

/** Firestore's REST shape: every value is wrapped in a type-named key. */
type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
};
type FirestoreDocument = { name: string; fields?: Record<string, FirestoreValue> };

let events: ForeseEvent[] | null = null;
let albums: GalleryAlbum[] | null = null;

/** The events Firestore holds, or `null` if it has not answered. */
export function remoteEvents(): ForeseEvent[] | null {
  return events;
}

/** The albums Firestore holds, or `null` if it has not answered. */
export function remoteAlbums(): GalleryAlbum[] | null {
  return albums;
}

/** Whether a project is configured at all. The admin page asks before it offers to sign in. */
export const firebaseConfigured = Boolean(PROJECT_ID && API_KEY);

function text(value: FirestoreValue | undefined): string | undefined {
  return typeof value?.stringValue === 'string' ? value.stringValue : undefined;
}

function number(value: FirestoreValue | undefined): number | undefined {
  if (typeof value?.integerValue === 'string') return Number(value.integerValue);
  if (typeof value?.doubleValue === 'number') return value.doubleValue;
  return undefined;
}

function docId(name: string): string {
  return name.slice(name.lastIndexOf('/') + 1);
}

function collectionUrl(collection: string): string {
  return `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?key=${API_KEY}&pageSize=300`;
}

async function readCollection(
  collection: string,
  signal: AbortSignal,
): Promise<FirestoreDocument[]> {
  const response = await fetch(collectionUrl(collection), { signal });
  if (!response.ok) throw new Error(`${collection}: ${response.status}`);
  const body = (await response.json()) as { documents?: FirestoreDocument[] };
  return body.documents ?? [];
}

/**
 * An event document → the shape the whole site already uses.
 *
 * The fields are the fields of `ForeseEvent`, named identically, so there is no
 * mapping table to keep in step — a document either matches the interface or it
 * is dropped. `date` is nullable in the interface and nullable here: an event
 * the club has announced without fixing a date is a real state, not missing
 * data.
 */
function toEvent(doc: FirestoreDocument): ForeseEvent | null {
  const f = doc.fields ?? {};
  const slug = text(f.slug);
  const name = text(f.name);
  if (!slug || !name) return null;

  return {
    id: text(f.id) ?? docId(doc.name),
    slug,
    name,
    date: text(f.date) ?? null,
    endDate: text(f.endDate),
    blurb: text(f.blurb),
    cover: text(f.cover),
    venue: text(f.venue),
  };
}

/**
 * Photograph documents → albums.
 *
 * Firestore has no nested arrays worth having, so photographs are their own
 * collection keyed by `eventId` and grouped here. `width` and `height` are
 * required by `GalleryPhoto` because they reserve the tile's box before the
 * image loads; a document without them is dropped rather than rendered as a
 * tile of unknown size that reflows the grid when it arrives.
 */
function toAlbums(docs: FirestoreDocument[]): GalleryAlbum[] {
  const byEvent = new Map<
    string,
    { pinned: boolean; photos: Array<GalleryPhoto & { order: number }> }
  >();

  for (const doc of docs) {
    const f = doc.fields ?? {};
    const eventId = text(f.eventId);
    const src = text(f.src);
    const width = number(f.width);
    const height = number(f.height);
    if (!eventId || !src || !width || !height) continue;

    const album = byEvent.get(eventId) ?? { pinned: false, photos: [] };
    if (f.pinned?.booleanValue) album.pinned = true;
    album.photos.push({
      id: docId(doc.name),
      src,
      width,
      height,
      alt: text(f.alt) ?? '',
      circulate: f.circulate?.booleanValue !== false,
      order: number(f.order) ?? 0,
    });
    byEvent.set(eventId, album);
  }

  return [...byEvent.entries()].map(([eventId, album]) => ({
    eventId,
    pinned: album.pinned || undefined,
    photos: album.photos
      .sort((a, b) => a.order - b.order)
      .map(({ order: _order, ...photo }) => photo),
  }));
}

/**
 * Fill the store. Called once, by `main.tsx`, before the app is imported.
 *
 * Never throws and never rejects: every failure here — no project configured,
 * no network, a slow answer, a malformed document — leaves the store empty and
 * the site renders the content it was built with.
 */
export async function loadRemoteContent(): Promise<void> {
  if (!firebaseConfigured) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const [eventDocs, photoDocs] = await Promise.all([
      readCollection('events', controller.signal),
      readCollection('album_photos', controller.signal),
    ]);

    const loaded = eventDocs.map(toEvent).filter((event): event is ForeseEvent => event !== null);
    // An empty collection is not an answer. Before the club has imported
    // anything there are no documents, and a site with no events is worse than
    // a site with last term's.
    if (loaded.length > 0) events = loaded;
    if (photoDocs.length > 0) albums = toAlbums(photoDocs);
  } catch {
    // Deliberately silent. This is the fallback path, not an error path: the
    // site has content either way, and a console full of red on a flaky
    // connection helps nobody.
  } finally {
    clearTimeout(timer);
  }
}
