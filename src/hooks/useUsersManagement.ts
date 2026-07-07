"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useAdminUsersQuery,
  useAdminUserSessionsQuery,
  useToggleUserVerifyMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  type AdminUserRow,
} from "@/hooks/queries";

export type UserRow = AdminUserRow;

export type SortKey = "name" | "email" | "emailVerified" | "createdAt" | "sessionCount";
export type FilterVerified = "all" | "verified" | "unverified";

export function useUsersManagement() {
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);
  const { data: users = [], isLoading, isFetching, error, refetch } = useAdminUsersQuery();
  const toggleVerifyMutation = useToggleUserVerifyMutation();
  const updateRoleMutation = useUpdateUserRoleMutation();
  const deleteMutation = useDeleteUserMutation();

  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterVerified, setFilterVerified] = useState<FilterVerified>("all");
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingVerify, setUpdatingVerify] = useState<string | null>(null);

  const { data: sessions = [], isLoading: sessionsLoading } = useAdminUserSessionsQuery(selectedUser?.id ?? null);

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
      await toggleVerifyMutation.mutateAsync({ userId: user.id, emailVerified: newStatus });
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
      await updateRoleMutation.mutateAsync({ userId: user.id, role: newRole });
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
      await deleteMutation.mutateAsync(confirmDelete.id);
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
    loading: isLoading || isFetching,
    error: error?.message ?? null,
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
    fetchUsers: refetch,
    handleToggleVerify,
    handleRoleChange,
    handleDelete,
  };
}
