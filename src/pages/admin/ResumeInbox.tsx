import { useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';
import { deleteResume, listResumes, readResume, type ResumeRow } from './api';
import { Notice } from './ui';

/**
 * What students have sent from the resume guide.
 *
 * The drop box on `/tips/resume` writes two documents: a row here, and the
 * PDF's bytes in a second collection under the same id. This lists the rows
 * and fetches a file only when the club asks for one, so opening the tab costs
 * a few kilobytes however many resumes have arrived.
 *
 * **Nothing on this page produces a shareable link.** A resume is fetched as
 * bytes, turned into a blob in this browser and handed to the download the
 * club asked for, then the object URL is revoked. That is the difference
 * between this and the gallery, whose photographs sit on a public CDN: a
 * resume carries a phone number and a home address, and the security rules
 * make the club's signed-in account the only thing that can read one.
 */
export function ResumeInbox() {
  const [rows, setRows] = useState<ResumeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = () => {
    listResumes()
      .then(setRows)
      .catch((cause: Error) => {
        setRows([]);
        setError(cause.message);
      });
  };

  useEffect(refresh, []);

  async function download(row: ResumeRow) {
    setBusy(row.id);
    setError(null);
    try {
      const url = URL.createObjectURL(await readResume(row.id));
      // A programmatic download rather than `window.open`: the click that
      // started this was spent before the fetch finished, and a popup opened
      // after an await is the kind a browser blocks.
      const link = document.createElement('a');
      link.href = url;
      link.download = row.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove(row: ResumeRow) {
    if (!window.confirm(`Delete ${row.name}? This cannot be undone.`)) return;
    setBusy(row.id);
    try {
      await deleteResume(row.id);
      refresh();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="gap-lg flex flex-col">
      <h2 className="text-h3">Resumes</h2>

      {error && <Notice tone="error">{error}</Notice>}

      {rows === null ? (
        <p className="text-small text-text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <Notice>
          Nothing has arrived yet. The drop box is at the foot of the resume guide, on{' '}
          <code>/tips/resume</code>.
        </Notice>
      ) : (
        <>
          <p className="text-label">
            {rows.length} resume{rows.length === 1 ? '' : 's'}
          </p>

          <ul className="gap-sm flex flex-col">
            {rows.map((row) => (
              <li key={row.id}>
                <Card padding="md" className="gap-md flex flex-wrap items-center justify-between">
                  <div className="gap-xs flex min-w-0 flex-col">
                    <p className="text-small truncate font-semibold">{row.name}</p>
                    <p className="text-caption text-text-muted">
                      {formatArrival(row.uploadedAt)} · {Math.round(row.size / 1000)} KB
                    </p>
                  </div>
                  <div className="gap-sm flex shrink-0">
                    <Button size="sm" disabled={busy === row.id} onClick={() => download(row)}>
                      {busy === row.id ? 'Working…' : 'Download'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy === row.id}
                      onClick={() => remove(row)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * When a submission arrived.
 *
 * Deliberately not `formatEventDate`, which pins the zone to UTC because an
 * event's date is a calendar fact. This is an instant, so it is shown in the
 * reader's own zone with the time on it: a resume sent at nine in the evening
 * in Chennai would otherwise be filed under the day before.
 */
function formatArrival(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
