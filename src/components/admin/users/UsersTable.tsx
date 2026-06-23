/**
 * Aurora — src/components/admin/users/UsersTable.tsx
 *
 * Tabular display of users with sorting column headers, layout-specific alignments,
 * loading overlay states, and verification/actions.
 */

"use client";

import type { UserRow } from "./UsersClient";

export type SortKey = "name" | "email" | "emailVerified" | "createdAt" | "sessionCount";

interface UsersTableProps {
  users: UserRow[];
  filteredUsers: UserRow[];
  loading: boolean;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  onViewUser: (user: UserRow) => void;
}

export function UsersTable({
  users,
  filteredUsers,
  loading,
  sortKey,
  sortDir,
  onSort,
  onViewUser,
}: UsersTableProps) {
  const SortHeader = ({
    label,
    sortKey: k,
    align = "center",
  }: {
    label: string;
    sortKey: SortKey;
    align?: "left" | "center" | "right";
  }) => (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary cursor-pointer hover:text-text-primary select-none whitespace-nowrap ${
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
      }`}
      onClick={() => onSort(k)}
    >
      {label}
      {sortKey === k && (
        <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
  );

  return (
    <>
      <div className="overflow-x-auto border border-border-subtle rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead className="bg-bg-primary/50 border-b border-border-subtle">
            <tr>
              <SortHeader label="Name" sortKey="name" align="left" />
              <SortHeader label="Email" sortKey="email" align="center" />
              <SortHeader label="Verified" sortKey="emailVerified" align="center" />
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary whitespace-nowrap text-center">
                Auth
              </th>
              <SortHeader label="Sessions" sortKey="sessionCount" align="center" />
              <SortHeader label="Joined" sortKey="createdAt" align="center" />
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary whitespace-nowrap text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-border-subtle transition-opacity duration-200 ${
              loading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-text-secondary text-sm">
                  No users match your filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-bg-primary/30 transition-colors">
                  <td className="px-4 py-3 text-text-primary font-medium whitespace-nowrap text-left">
                    <div className="flex items-center justify-start gap-2">
                      <span>{user.name || <span className="text-text-muted italic">No name</span>}</span>
                      {user.role && user.role !== "user" && (
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            user.role === "admin"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap text-center">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-0.5 rounded-full">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-error bg-error/10 px-2.5 py-0.5 rounded-full">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      {user.accounts.map((acc) => (
                        <span
                          key={acc.id}
                          className="text-[10px] font-mono uppercase tracking-wider bg-bg-primary border border-border-subtle px-1.5 py-0.5 rounded"
                          title={acc.providerId}
                        >
                          {acc.providerId === "credential" ? "Email" : acc.providerId}
                        </span>
                      ))}
                      {user.accounts.length === 0 && (
                        <span className="text-[10px] text-text-muted italic">none</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center min-w-[2rem] text-xs font-semibold px-2 py-0.5 rounded-full ${
                        user.sessionCount > 0
                          ? "bg-accent-primary/10 text-accent-primary"
                          : "bg-bg-primary text-text-muted"
                      }`}
                    >
                      {user.sessionCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-text-secondary text-xs whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onViewUser(user)}
                      className="text-xs font-semibold text-accent-primary hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-text-muted text-right">
        {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
        {filteredUsers.length !== users.length && ` (filtered from ${users.length})`}
      </p>
    </>
  );
}
