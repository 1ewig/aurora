"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AdminHeaderPanel } from "@/components/ui/AdminHeaderPanel";
import { Button } from "@/components/ui/Button";
import { UserDetailModal } from "./UserDetailModal";
import { useUserSessions } from "@/hooks/useUserSessions";

export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  accounts: Array<{ id: string; providerId: string; createdAt: string }>;
  sessionCount: number;
  lastSessionAt: string | null;
}

type SortKey = "name" | "email" | "emailVerified" | "createdAt" | "sessionCount";
type FilterVerified = "all" | "verified" | "unverified";

export function UsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterVerified, setFilterVerified] = useState<FilterVerified>("all");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { sessions, loading: sessionsLoading } = useUserSessions(selectedUser?.id ?? null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch users");
      }
      setUsers(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let list = users;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (filterVerified === "verified") {
      list = list.filter((u) => u.emailVerified);
    } else if (filterVerified === "unverified") {
      list = list.filter((u) => !u.emailVerified);
    }

    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = (a.name || "").localeCompare(b.name || "");
          break;
        case "email":
          cmp = a.email.localeCompare(b.email);
          break;
        case "emailVerified":
          cmp = Number(a.emailVerified) - Number(b.emailVerified);
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "sessionCount":
          cmp = a.sessionCount - b.sessionCount;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [users, searchQuery, filterVerified, sortKey, sortDir]);

  const handleToggleVerify = async (user: UserRow, newStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailVerified: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, emailVerified: newStatus } : u
        )
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => prev ? { ...prev, emailVerified: newStatus } : null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${confirmDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
      setConfirmDelete(null);
      if (selectedUser?.id === confirmDelete.id) setSelectedUser(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const SortHeader = ({
    label,
    sortKey: k,
  }: {
    label: string;
    sortKey: SortKey;
  }) => (
    <th
      className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary cursor-pointer hover:text-text-primary select-none whitespace-nowrap"
      onClick={() => toggleSort(k)}
    >
      {label}
      {sortKey === k && (
        <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
  );

  return (
    <div className="space-y-8 pb-12">
      <AdminHeaderPanel
        title="User Management"
        description="View and manage registered accounts, sessions, and authentication methods."
      />

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-primary border border-border-medium rounded-full focus:border-accent-primary focus:outline-none text-sm transition-colors"
          />
        </div>
        <select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value as FilterVerified)}
          className="px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full focus:border-accent-primary focus:outline-none text-sm transition-colors"
        >
          <option value="all">All Users</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
        <Button variant="ghost" size="md" onClick={fetchUsers}>
          Refresh
        </Button>
      </div>

      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-text-secondary text-sm">
          Loading users...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-error border border-border-subtle rounded-2xl bg-white">
          {error}
        </div>
      ) : (
        <>
          {/* Users Table */}
          <div className="overflow-x-auto border border-border-subtle rounded-2xl bg-white">
            <table className="w-full text-sm">
              <thead className="bg-bg-primary/50 border-b border-border-subtle">
                <tr>
                  <SortHeader label="Name" sortKey="name" />
                  <SortHeader label="Email" sortKey="email" />
                  <SortHeader label="Verified" sortKey="emailVerified" />
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary whitespace-nowrap">
                    Auth
                  </th>
                  <SortHeader label="Sessions" sortKey="sessionCount" />
                  <SortHeader label="Joined" sortKey="createdAt" />
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-secondary text-sm">
                      No users match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-bg-primary/30 transition-colors">
                      <td className="px-4 py-3 text-text-primary font-medium whitespace-nowrap">
                        {user.name || <span className="text-text-muted italic">No name</span>}
                      </td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-0.5 rounded-full">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-error bg-error/10 px-2.5 py-0.5 rounded-full">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
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
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-xs font-semibold text-accent-primary hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setConfirmDelete(user)}
                            className="text-xs font-semibold text-error hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-text-muted text-right">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== users.length && ` (filtered from ${users.length})`}
          </p>
        </>
      )}

      {/* Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        sessions={sessions}
        sessionsLoading={sessionsLoading}
        onClose={() => setSelectedUser(null)}
        onToggleVerify={handleToggleVerify}
        onDelete={(u) => { setSelectedUser(null); setConfirmDelete(u); }}
      />

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-display font-bold text-lg uppercase tracking-wider">Delete User</h3>
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-text-primary">
                {confirmDelete.name || confirmDelete.email}
              </span>
              ? This will permanently remove the user, their sessions, and linked accounts.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-55"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 text-sm font-semibold text-white bg-error rounded-full hover:opacity-90 transition-all cursor-pointer disabled:opacity-55"
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
