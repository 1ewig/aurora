/**
 * Aurora — src/components/admin/users/DeleteConfirmModal.tsx
 *
 * Fixed overlay confirmation modal for deleting a user account.
 */

"use client";

import type { UserRow } from "./UsersClient";

interface DeleteConfirmModalProps {
  user: UserRow;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  user,
  deleting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-4">
        <h3 className="font-display font-bold text-lg uppercase tracking-wider">Delete User</h3>
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-text-primary">
            {user.name || user.email}
          </span>
          ? This will permanently remove the user, their sessions, and linked accounts.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-55"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-5 py-2 text-sm font-semibold text-white bg-error rounded-full hover:opacity-90 transition-all cursor-pointer disabled:opacity-55"
          >
            {deleting ? "Deleting..." : "Delete Forever"}
          </button>
        </div>
      </div>
    </div>
  );
}
