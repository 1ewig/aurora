/**
 * Aurora — src/components/admin/users/DeleteConfirmModal.tsx
 *
 * Fixed overlay confirmation modal for deleting a user account.
 */

"use client";

import { Button } from "@/components/ui/Button";
import type { UserRow } from "@/hooks/useUsersManagement";

interface DeleteConfirmModalProps {
  user: UserRow | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Renders the delete user confirmation dialog modal. */
export function DeleteConfirmModal({
  user,
  deleting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <>
      {user && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog Content */}
          <div
            className="relative w-full max-w-md bg-bg-secondary border border-border-subtle rounded-[24px] shadow-2xl p-6 space-y-4"
          >
            <h3 className="font-display font-bold text-lg uppercase tracking-wider">Delete User</h3>
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-text-primary">
                {user.name || user.email}
              </span>
              ? This will permanently remove the user, their sessions, and linked accounts.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                onClick={onClose}
                disabled={deleting}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={deleting}
                variant="ghost"
                size="sm"
                className="bg-error text-white hover:opacity-90 border-error"
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
