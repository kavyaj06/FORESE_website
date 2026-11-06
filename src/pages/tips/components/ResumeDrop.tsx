import { useRef, useState } from 'react';
import { Check, FileText, Upload } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
import { describeSize, rejectionFor, resumeDropConfigured, submitResume } from '@/lib/resumeDrop';
import { RESUME_DROP } from '../data';

/**
 * Where a student hands their resume over.
 *
 * The last thing on the resume guide, and the only thing on Placement Prep
 * that takes something from the reader rather than telling them something. It
 * is mounted inside act three alone: the advice above it is about a resume, so
 * this is the one guide where the offer makes sense.
 *
 * It renders nothing at all when there is no Firebase project configured.
 * A student should never be shown an uploader that cannot work, and the
 * alternative — a disabled control with an explanation about environment
 * variables — is a message for the club written on a page for students.
 */
export function ResumeDrop() {
  if (!resumeDropConfigured) return null;
  return <DropSection />;
}

type Phase = 'idle' | 'sending' | 'done';

function DropSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function reset() {
    if (input.current) input.current.value = '';
  }

  /**
   * Take a file from the picker or from a drop.
   *
   * Refused here before anything is sent. The security rules refuse the same
   * two cases on the server, which is the enforcement; this is so the student
   * hears about it now rather than after a megabyte has gone up.
   */
  function take(next: File | null | undefined) {
    if (!next) return;
    const reason = rejectionFor(next);
    if (reason) {
      setError(RESUME_DROP.errors[reason]);
      setFile(null);
      reset();
      return;
    }
    setError(null);
    setFile(next);
    setPhase('idle');
  }

  async function send() {
    if (!file) return;
    setPhase('sending');
    setPercent(0);
    setError(null);
    try {
      // Not per frame: XHR reports progress a handful of times across an
      // upload this size, which is why a state update is the right thing here
      // and a MotionValue would be ceremony.
      await submitResume(file, (fraction) => setPercent(Math.round(fraction * 100)));
      setPhase('done');
      setFile(null);
      reset();
    } catch (cause) {
      const reason = (cause as Error).message === 'closed' ? 'closed' : 'failed';
      setError(RESUME_DROP.errors[reason]);
      // Back to idle with the file still chosen, so Send can simply be
      // pressed again. Making them find the file a second time to retry a
      // dropped connection is the wrong way round.
      setPhase('idle');
    }
  }

  const sending = phase === 'sending';

  return (
    <div className="py-section">
      <Container>
        <Reveal
          staggerChildren
          className="gap-3xl desktop:grid-cols-2 desktop:items-start grid grid-cols-1"
        >
          <RevealItem className="gap-lg flex flex-col">
            <SectionHeading
              as="h3"
              measure="measure"
              eyebrow={RESUME_DROP.eyebrow}
              title={RESUME_DROP.title}
              description={RESUME_DROP.description}
            />
            <p className="text-small text-text-subtle max-w-measure">{RESUME_DROP.note}</p>
          </RevealItem>

          <RevealItem className="gap-md flex flex-col">
            {phase === 'done' ? (
              <div className="border-border bg-surface gap-md p-xl flex flex-col items-start rounded-lg border">
                <p className="text-body gap-sm flex items-center font-semibold">
                  <Check size={18} strokeWidth={2} aria-hidden="true" />
                  {RESUME_DROP.done}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPhase('idle');
                    setPercent(0);
                  }}
                >
                  {RESUME_DROP.again}
                </Button>
              </div>
            ) : (
              <label
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!sending) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  if (!sending) take(event.dataTransfer.files[0]);
                }}
                className={cn(
                  'gap-sm p-xl flex flex-col items-start rounded-lg border border-dashed',
                  'duration-base ease-out-brand transition-colors',
                  // The ring belongs on the panel, not on the input: the input
                  // is a screen-reader-only pixel, so its own focus ring would
                  // be invisible to the keyboard user it exists for.
                  'has-[:focus-visible]:outline-focus has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2',
                  // A dashed hairline at `--color-border` is invisible against
                  // the grey it encloses, and an invisible drop target is not
                  // one. It rests a step darker and darkens again on approach.
                  dragging
                    ? 'border-text bg-surface-raised'
                    : 'border-border-strong bg-surface hover:border-text-subtle',
                  sending ? 'cursor-wait' : 'cursor-pointer',
                )}
              >
                <input
                  ref={input}
                  type="file"
                  accept="application/pdf"
                  disabled={sending}
                  aria-describedby="resume-drop-hint"
                  onChange={(event) => take(event.target.files?.[0])}
                  className="sr-only"
                />

                <span className="text-body gap-sm flex items-center font-medium">
                  {file ? (
                    <FileText size={18} strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <Upload size={18} strokeWidth={1.75} aria-hidden="true" />
                  )}
                  {file ? file.name : RESUME_DROP.choose}
                </span>

                <span id="resume-drop-hint" className="text-small text-text-muted">
                  {file ? `${describeSize(file.size)}. ${RESUME_DROP.change}.` : RESUME_DROP.hint}
                </span>
              </label>
            )}

            {file && phase !== 'done' && (
              <div className="gap-sm flex flex-wrap items-center">
                <Button onClick={send} disabled={sending}>
                  {sending ? `${RESUME_DROP.sending}…` : RESUME_DROP.send}
                </Button>

                {sending &&
                  (prefersReducedMotion ? (
                    // A different tree, not the same tree moving more slowly:
                    // there is no animated element here to reduce.
                    <p role="status" className="text-small text-text-muted tabular-nums">
                      {RESUME_DROP.sending} {percent}%
                    </p>
                  ) : (
                    <p role="status" className="min-w-24 flex-1">
                      <span className="sr-only">
                        {RESUME_DROP.sending} {percent}%
                      </span>
                      <span aria-hidden="true" className="bg-border block h-px w-full">
                        <span
                          className="bg-text duration-base ease-out-brand block h-px origin-left transition-transform"
                          style={{ transform: `scaleX(${percent / 100})` }}
                        />
                      </span>
                    </p>
                  ))}
              </div>
            )}

            {error && (
              <p role="alert" className="text-small text-text max-w-measure">
                {error}
              </p>
            )}
          </RevealItem>
        </Reveal>
      </Container>
    </div>
  );
}
