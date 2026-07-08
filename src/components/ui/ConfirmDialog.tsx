/**
 * Aurora — src/components/ui/ConfirmDialog.tsx
 *
 * Modal confirmation dialog with animated backdrop and scale entrance.
 */

"use client";

import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
  loading?: boolean;
}

/** Confirmation modal with animated backdrop and scale entrance. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  disabled,
  loading,
}: ConfirmDialogProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onCancel}
          />

          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="relative w-full max-w-sm bg-bg-secondary border border-border-subtle rounded-[24px] p-6 sm:p-8 shadow-2xl"
          >
            <h2
              id="confirm-dialog-title"
              className="font-display font-bold text-xl sm:text-2xl uppercase tracking-wide mb-2"
            >
              {title}
            </h2>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                onClick={onCancel}
                disabled={disabled || loading}
                variant="ghost"
                size="sm"
                fullWidth
              >
                {cancelLabel}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={disabled || loading}
                variant="ghost"
                size="sm"
                fullWidth
                className="border-error text-error hover:bg-error hover:text-white hover:border-error"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{confirmLabel}</span>
                  </>
                ) : (
                  confirmLabel
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
