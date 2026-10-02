import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A line of feedback above a form.
 *
 * Errors here are usually one of two things and the wording should let the
 * club tell them apart: a permission error means the rules refused the write
 * (wrong account), anything else means the write never arrived.
 */
export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'error' | 'success';
  children: ReactNode;
}) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'text-small rounded-md border px-4 py-3',
        tone === 'error' && 'border-border-strong text-text',
        tone === 'success' && 'border-border text-text-muted',
        tone === 'info' && 'border-border text-text-muted',
      )}
    >
      {children}
    </p>
  );
}
