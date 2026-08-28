import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useScrollLock } from '@/hooks/useScrollLock';

type ModalVariant = 'panel' | 'bare';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. Required — a dialog must announce itself. */
  title: string;
  /** Hide the title visually while keeping it for screen readers. */
  hideTitle?: boolean;
  /**
   * `panel` — the standard bordered surface with a heading row.
   * `bare`  — no surface, no padding, a floating close control. For content
   *           that is its own presentation, such as the gallery lightbox.
   *           The title is always screen-reader only in this variant.
   */
  variant?: ModalVariant;
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
 * Built now because the Gallery lightbox in Phase 2 needs exactly this — which
 * is what the `bare` variant serves: same focus and scroll behaviour, none of
 * the panel chrome.
 */
export function Modal({
  open,
  onClose,
  title,
  hideTitle = false,
  variant = 'panel',
  children,
  className,
}: ModalProps) {
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

      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      );
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
      className="animate-fade-in p-gutter fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop. Presentational — the dialog itself owns the close semantics,
          so this is not a button and is hidden from assistive tech. */}
      <div
        className="bg-surface-inverse/70 absolute inset-0"
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
          'relative z-10 max-h-full w-full',
          variant === 'panel'
            ? 'bg-surface-raised max-w-content overflow-auto rounded-lg shadow-lg'
            : 'flex flex-col',
          className,
        )}
      >
        {variant === 'panel' ? (
          <>
            <div className="gap-md p-lg flex items-start justify-between">
              <h2 id={titleId} className={cn('text-h3', hideTitle && 'sr-only')}>
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="text-text-muted hover:text-text hover:bg-surface duration-fast -m-1 rounded-md p-1 transition-colors"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="px-lg pb-lg">{children}</div>
          </>
        ) : (
          <>
            <h2 id={titleId} className="sr-only">
              {title}
            </h2>
            {/* Kept inside the panel so the focus trap includes it. Coloured
                against the backdrop rather than against a surface, since in
                this variant there is no surface behind it. */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="bg-surface-inverse/60 text-text-inverse hover:bg-surface-inverse duration-fast rounded-pill absolute -top-1 right-0 z-20 flex size-11 items-center justify-center backdrop-blur-sm transition-colors"
            >
              <X size={20} aria-hidden="true" />
            </button>
            {children}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
