"use client";

import type { UserRow } from "./UsersClient";
import type { SessionRow } from "@/hooks/useUserSessions";

interface UserDetailModalProps {
  user: UserRow | null;
  sessions: SessionRow[];
  sessionsLoading: boolean;
  onClose: () => void;
  onToggleVerify: (user: UserRow, newStatus: boolean) => Promise<void>;
  onDelete: (user: UserRow) => void;
}

export function UserDetailModal({
  user,
  sessions,
  sessionsLoading,
  onClose,
  onToggleVerify,
  onDelete,
}: UserDetailModalProps) {
  if (!user) return null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-20 pb-12 px-4 bg-black/40 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="font-display font-bold text-lg uppercase tracking-wider">User Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer rounded-full hover:bg-bg-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Profile Section */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-bg-primary border border-border-subtle flex items-center justify-center text-text-secondary text-lg font-bold uppercase shrink-0 overflow-hidden">
              {user.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                (user.name || user.email)[0]
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-bold text-text-primary text-lg truncate">
                  {user.name || <span className="text-text-muted italic">No name</span>}
                </h3>
                {user.emailVerified ? (
                  <span className="text-[11px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Verified</span>
                ) : (
                  <span className="text-[11px] font-semibold text-error bg-error/10 px-2 py-0.5 rounded-full">Unverified</span>
                )}
              </div>
              <p className="text-text-secondary text-sm mt-0.5">{user.email}</p>
              <p className="text-text-muted text-xs mt-1">
                Joined {formatDate(user.createdAt)}
                {user.createdAt !== user.updatedAt && ` · Updated ${formatDate(user.updatedAt)}`}
              </p>
            </div>
          </div>

          {/* Accounts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Linked Accounts</h4>
            {user.accounts.length === 0 ? (
              <p className="text-sm text-text-muted italic">No accounts linked</p>
            ) : (
              <div className="space-y-2">
                {user.accounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between bg-bg-primary rounded-lg px-4 py-2.5">
                    <div>
                      <span className="text-sm font-mono font-semibold text-text-primary uppercase tracking-wider">
                        {acc.providerId === "credential" ? "Email & Password" : acc.providerId}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">{formatDate(acc.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sessions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Sessions</h4>
              <span className="text-[11px] text-text-muted">{user.sessionCount} total</span>
            </div>
            {sessionsLoading ? (
              <div className="text-sm text-text-muted text-center py-4">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-text-muted italic">No active sessions</p>
            ) : (
              <div className="overflow-x-auto border border-border-subtle rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-bg-primary/50 border-b border-border-subtle">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-text-secondary uppercase tracking-wider">Created</th>
                      <th className="px-3 py-2 text-left font-semibold text-text-secondary uppercase tracking-wider">Expires</th>
                      <th className="px-3 py-2 text-left font-semibold text-text-secondary uppercase tracking-wider">IP</th>
                      <th className="px-3 py-2 text-left font-semibold text-text-secondary uppercase tracking-wider">User Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {sessions.map((s) => {
                      const expired = new Date(s.expiresAt) < new Date();
                      return (
                        <tr key={s.id} className={expired ? "opacity-50" : ""}>
                          <td className="px-3 py-2 whitespace-nowrap">{formatDate(s.createdAt)}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={expired ? "text-error" : "text-success"}>
                              {formatDate(s.expiresAt)}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono max-w-[120px] truncate">{s.ipAddress || "—"}</td>
                          <td className="px-3 py-2 max-w-[200px] truncate text-text-muted">{s.userAgent || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-bg-primary/30">
          <button
            onClick={() => onDelete(user)}
            className="text-xs font-semibold text-error hover:underline cursor-pointer"
          >
            Delete User
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleVerify(user, !user.emailVerified)}
              className="px-4 py-2 text-xs font-semibold bg-accent-primary/10 text-accent-primary rounded-full hover:bg-accent-primary/20 transition-all cursor-pointer"
            >
              {user.emailVerified ? "Mark Unverified" : "Mark Verified"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-bg-primary border border-border-medium rounded-full hover:bg-bg-secondary transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
