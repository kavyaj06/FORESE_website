import type { ReactNode } from 'react';

/** A labelled form row: label, the control, and the reason it exists. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="gap-xs flex flex-col">
      <span className="text-label">{label}</span>
      {children}
      {hint && <span className="text-caption text-text-muted">{hint}</span>}
    </label>
  );
}
