/**
 * Aurora — src/hooks/useUsersManagement.ts
 *
 * Encapsulates state and business logic for the admin user management page.
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserSessions } from "@/hooks/useUserSessions";

/** Shape of a user row returned by GET /api/admin/users. */
export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  role: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  accounts: Array<{ id: string; providerId: string; createdAt: string }>;
  sessionCount: number;
  lastSessionAt: string | null;
}

export type SortKey = "name" | "email" | "emailVerified" | "createdAt" | "sessionCount";
export type FilterVerified = "all" | "verified" | "unverified";

export function useUsersManagement() {
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);
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
  const [updatingVerify, setUpdatingVerify] = useState<string | null>(null);

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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filteredUsers = useMemo(() => {
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
    setUpdatingVerify(user.id);
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
        setSelectedUser((prev) => (prev ? { ...prev, emailVerified: newStatus } : null));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingVerify(null);
    }
  };

  const handleRoleChange = async (user: UserRow, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, role: newRole } : u
        )
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
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

  return {
    users,
    filteredUsers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortKey,
    sortDir,
    toggleSort,
    filterVerified,
    setFilterVerified,
    selectedUser,
    setSelectedUser,
    confirmDelete,
    setConfirmDelete,
    deleting,
    updatingVerify,
    sessions,
    sessionsLoading,
    isAdmin,
    fetchUsers,
    handleToggleVerify,
    handleRoleChange,
    handleDelete,
  };
}
