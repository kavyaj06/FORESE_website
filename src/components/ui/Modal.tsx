import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useScrollLock } from '@/hooks/useScrollLock';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. Required — a dialog must announce itself. */
  title: string;
  /** Hide the title visually while keeping it for screen readers. */
  hideTitle?: boolean;
  children: ReactNode;
  className?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog rendered in a portal.
 *
 * Handles the four things a modal must get right and is usually asked to
 * retrofit later: Escape to close, focus moved in on open and restored on
 * close, Tab cycling trapped inside, and the background frozen.
 *
 * Built now because the Gallery lightbox in Phase 2 needs exactly this.
 */
export function Modal({ open, onClose, title, hideTitle = false, children, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useScrollLock(open);

  // Remember what had focus, then move focus into the dialog.
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? panelRef.current)?.focus();

    return () => {
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Wrap focus at both ends so Tab never escapes to the page behind.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  if (!open) return null;

  return createPortal(
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-gutter"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop. Presentational — the dialog itself owns the close semantics,
          so this is not a button and is hidden from assistive tech. */}
      <div
        className="absolute inset-0 bg-surface-inverse/70"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'bg-surface-raised shadow-lg relative z-10 max-h-full w-full max-w-content overflow-auto rounded-lg',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-md p-lg">
          <h2 id={titleId} className={cn('text-h3', hideTitle && 'sr-only')}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-text-muted hover:text-text hover:bg-surface -m-1 rounded-md p-1 transition-colors duration-fast"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="px-lg pb-lg">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
