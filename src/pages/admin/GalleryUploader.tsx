import { useEffect, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import type { ForeseEvent } from '@/data/events';
import {
  deletePhoto,
  listEvents,
  listPhotos,
  readImageSize,
  savePhoto,
  uploadConfigured,
  uploadImage,
  type PhotoRow,
} from './api';
import { Field, Notice } from './ui';

/**
 * Post photographs to an event's album.
 *
 * Two things happen per file, in this order and for a reason:
 *
 *  1. **Its true pixel size is read, before it is uploaded.** `GalleryPhoto`
 *     requires `width` and `height` because they reserve each tile's box in
 *     the grid — without them every picture that loads shifts the page under
 *     the reader. Reading them from the file is the only way the club can post
 *     an album without measuring anything.
 *  2. **It is uploaded, then a row is written.** The row is what the site
 *     reads; a file with no row appears nowhere. That ordering is also what
 *     makes an unsigned upload preset safe here.
 *
 * `alt` is required by the form. The gallery's own data file says why: it is
 * read aloud by screen readers and shown as the lightbox caption, so an empty
 * one is a photograph that some readers simply do not get.
 */
export function GalleryUploader() {
  const [events, setEvents] = useState<ForeseEvent[]>([]);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [eventId, setEventId] = useState('');
  const [queue, setQueue] = useState<Array<{ file: File; alt: string }>>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = () => {
    Promise.all([listEvents(), listPhotos()])
      .then(([loadedEvents, loadedPhotos]) => {
        setEvents(loadedEvents);
        setPhotos(loadedPhotos);
        setEventId((current) => current || (loadedEvents[0]?.id ?? ''));
      })
      .catch((cause: Error) => setError(cause.message));
  };

  useEffect(refresh, []);

  const event = events.find((candidate) => candidate.id === eventId);
  const albumPhotos = photos.filter((photo) => photo.eventId === eventId);

  function queueFiles(files: FileList | null) {
    if (!files) return;
    setQueue([...files].map((file) => ({ file, alt: '' })));
    setError(null);
    setStatus(null);
  }

  async function upload() {
    if (!event) return;
    if (queue.some((item) => item.alt.trim() === '')) {
      setError('Every photograph needs a description before it can go up.');
      return;
    }

    setBusy(true);
    setError(null);
    let done = 0;

    try {
      for (const [index, item] of queue.entries()) {
        setStatus(`Uploading ${index + 1} of ${queue.length}…`);
        const size = await readImageSize(item.file);
        const src = await uploadImage(item.file, event.slug);
        await savePhoto({
          id: `${event.slug}-${Date.now()}-${index}`,
          eventId: event.id,
          src,
          width: size.width,
          height: size.height,
          alt: item.alt.trim(),
          circulate: true,
          order: albumPhotos.length + index,
        });
        done += 1;
      }
      setStatus(`${done} photograph${done === 1 ? '' : 's'} added.`);
      setQueue([]);
      if (fileInput.current) fileInput.current.value = '';
      refresh();
    } catch (cause) {
      setError(`${(cause as Error).message} (${done} of ${queue.length} went up)`);
    } finally {
      setBusy(false);
    }
  }

  async function remove(photo: PhotoRow) {
    if (!window.confirm('Remove this photograph from the album?')) return;
    await deletePhoto(photo.id);
    refresh();
  }

  if (!uploadConfigured) {
    return (
      <Notice tone="error">
        Image uploads are not configured yet — <code>VITE_CLOUDINARY_CLOUD_NAME</code> and{' '}
        <code>VITE_CLOUDINARY_PRESET</code> are missing. See <code>docs/admin-setup.md</code>.
      </Notice>
    );
  }

  return (
    <div className="gap-lg flex flex-col">
      <h2 className="text-h3">Gallery</h2>

      {error && <Notice tone="error">{error}</Notice>}
      {status && !error && <Notice tone="success">{status}</Notice>}

      {events.length === 0 ? (
        <Notice>Add an event first — photographs are filed under one.</Notice>
      ) : (
        <>
          <Field label="Album" hint="Photographs are filed under the event they belong to.">
            <select
              value={eventId}
              onChange={(input) => setEventId(input.target.value)}
              className="admin-input"
            >
              {events.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Photographs" hint="JPEG or PNG. They are resized and served from a CDN.">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              onChange={(input) => queueFiles(input.target.files)}
              className="admin-input"
            />
          </Field>

          {queue.length > 0 && (
            <ul className="gap-md flex flex-col">
              {queue.map((item, index) => (
                <li key={`${item.file.name}-${index}`}>
                  <Card padding="md" className="gap-sm flex flex-col">
                    <p className="text-small font-semibold">{item.file.name}</p>
                    <Field label="What it shows" hint="Read aloud by screen readers.">
                      <input
                        required
                        value={item.alt}
                        onChange={(input) =>
                          setQueue((current) =>
                            current.map((entry, position) =>
                              position === index ? { ...entry, alt: input.target.value } : entry,
                            ),
                          )
                        }
                        className="admin-input"
                      />
                    </Field>
                  </Card>
                </li>
              ))}
            </ul>
          )}

          <div className="gap-sm flex">
            <Button disabled={busy || queue.length === 0} onClick={upload}>
              {busy ? 'Uploading…' : `Add ${queue.length || ''} to the album`}
            </Button>
            {queue.length > 0 && (
              <Button variant="ghost" disabled={busy} onClick={() => setQueue([])}>
                Clear
              </Button>
            )}
          </div>

          <div>
            <h3 className="text-label mb-sm">
              In this album: {albumPhotos.length} photograph{albumPhotos.length === 1 ? '' : 's'}
            </h3>
            <ul className="gap-sm grid grid-cols-3 sm:grid-cols-5">
              {albumPhotos.map((photo) => (
                <li key={photo.id} className="group relative">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="bg-surface aspect-square w-full rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => remove(photo)}
                    className="bg-bg text-text text-caption absolute top-1 right-1 rounded-sm px-2 py-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
