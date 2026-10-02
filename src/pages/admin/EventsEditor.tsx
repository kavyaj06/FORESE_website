import { useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';
import type { ForeseEvent } from '@/data/events';
import { deleteEvent, listEvents, saveEvent } from './api';
import { Field, Notice, slugify } from './ui';

/**
 * Add, edit and remove the club's events.
 *
 * The form's fields are `ForeseEvent`'s fields, in the order the events page
 * reads them. Nothing here computes a status: `eventStatus()` derives that
 * from the dates at render, so an event becomes "ongoing" on the right morning
 * without anybody remembering to come back and change it.
 */
export function EventsEditor() {
  const [events, setEvents] = useState<ForeseEvent[] | null>(null);
  const [editing, setEditing] = useState<ForeseEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    listEvents()
      .then(setEvents)
      .catch((cause: Error) => setError(cause.message));
  };

  useEffect(refresh, []);

  const blank: ForeseEvent = { id: '', slug: '', name: '', date: null };

  async function submit(event: ForeseEvent) {
    setBusy(true);
    setError(null);
    try {
      await saveEvent(event);
      setEditing(null);
      refresh();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(event: ForeseEvent) {
    if (!window.confirm(`Delete “${event.name}”? Its photographs stay but will not appear.`))
      return;
    setBusy(true);
    try {
      await deleteEvent(event.id);
      refresh();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <EventForm event={editing} busy={busy} onCancel={() => setEditing(null)} onSave={submit} />
    );
  }

  return (
    <div className="gap-lg flex flex-col">
      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex items-center justify-between">
        <h2 className="text-h3">Events</h2>
        <Button size="sm" onClick={() => setEditing(blank)}>
          Add an event
        </Button>
      </div>

      {events === null && <p className="text-small text-text-muted">Loading…</p>}

      {events?.length === 0 && (
        <p className="text-small text-text-muted">
          Nothing published yet. The site is showing the events built into it.
        </p>
      )}

      <ul className="gap-md flex flex-col">
        {events?.map((event) => (
          <li key={event.id}>
            <Card padding="md" className="gap-md flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-body font-semibold">{event.name}</p>
                <p className="text-small text-text-muted mt-xs">
                  {event.date ?? 'No date yet'}
                  {event.endDate ? ` → ${event.endDate}` : ''} · /gallery/{event.slug}
                </p>
              </div>
              <div className="gap-xs flex shrink-0">
                <Button size="sm" variant="secondary" onClick={() => setEditing(event)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => remove(event)}>
                  Delete
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventForm({
  event,
  busy,
  onCancel,
  onSave,
}: {
  event: ForeseEvent;
  busy: boolean;
  onCancel: () => void;
  onSave: (event: ForeseEvent) => void;
}) {
  const isNew = event.id === '';
  const [draft, setDraft] = useState<ForeseEvent>(event);

  const set = (patch: Partial<ForeseEvent>) => setDraft((current) => ({ ...current, ...patch }));

  /**
   * The slug follows the name until the event exists, then stops.
   *
   * It is the album's URL (`/gallery/<slug>`) and the folder its photographs
   * were filed under. Changing it on a published event breaks both, so the
   * field is locked once there is something to break.
   */
  function setName(name: string) {
    set(isNew ? { name, slug: slugify(name), id: slugify(name) } : { name });
  }

  return (
    <form
      className="gap-lg flex flex-col"
      onSubmit={(submitEvent) => {
        submitEvent.preventDefault();
        onSave(draft);
      }}
    >
      <h2 className="text-h3">{isNew ? 'New event' : draft.name}</h2>

      <Field label="Name" hint="As it should read on the events page.">
        <input
          required
          value={draft.name}
          onChange={(input) => setName(input.target.value)}
          className="admin-input"
        />
      </Field>

      <Field
        label="Slug"
        hint={
          isNew
            ? 'Taken from the name. It becomes the album’s address.'
            : 'Locked: this is the album’s address and its photographs’ folder.'
        }
      >
        <input
          required
          readOnly={!isNew}
          value={draft.slug}
          onChange={(input) => set({ slug: slugify(input.target.value) })}
          className="admin-input"
        />
      </Field>

      <div className="gap-md grid grid-cols-1 sm:grid-cols-2">
        <Field label="Date" hint="Leave empty if it has not been fixed yet.">
          <input
            type="date"
            value={draft.date ?? ''}
            onChange={(input) => set({ date: input.target.value || null })}
            className="admin-input"
          />
        </Field>
        <Field label="End date" hint="Only for events running over several days.">
          <input
            type="date"
            value={draft.endDate ?? ''}
            onChange={(input) => set({ endDate: input.target.value || undefined })}
            className="admin-input"
          />
        </Field>
      </div>

      <Field label="Venue">
        <input
          value={draft.venue ?? ''}
          onChange={(input) => set({ venue: input.target.value })}
          className="admin-input"
        />
      </Field>

      <Field label="Blurb" hint="One line of context, shown on the card.">
        <textarea
          rows={2}
          value={draft.blurb ?? ''}
          onChange={(input) => set({ blurb: input.target.value })}
          className="admin-input"
        />
      </Field>

      <Field
        label="Cover image"
        hint="A path or URL. Leave empty to use the album’s first photograph."
      >
        <input
          value={draft.cover ?? ''}
          onChange={(input) => set({ cover: input.target.value })}
          className="admin-input"
        />
      </Field>

      <div className="gap-sm flex">
        <Button type="submit" disabled={busy || !draft.name || !draft.slug}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
