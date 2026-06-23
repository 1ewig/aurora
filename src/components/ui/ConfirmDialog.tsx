/**
 * Aurora — src/components/ui/ConfirmDialog.tsx
 *
 * Modal confirmation dialog with animated backdrop and scale entrance.
 */

"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
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
}

const backdropVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)", WebkitBackdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" },
};

const dialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.25, ease: [0.55, 0.06, 0.68, 0.19] },
  },
};

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
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onCancel}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="relative w-full max-w-sm bg-bg-secondary border border-border-subtle rounded-[24px] p-6 sm:p-8 shadow-2xl"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
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
                disabled={disabled}
                variant="ghost"
                size="sm"
                fullWidth
              >
                {cancelLabel}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={disabled}
                variant="ghost"
                size="sm"
                fullWidth
                className="border-error text-error hover:bg-error hover:text-white hover:border-error"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
