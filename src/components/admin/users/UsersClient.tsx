"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { AdminHeaderPanel } from "@/components/ui/AdminHeaderPanel";
import { UserDetailModal } from "./UserDetailModal";
import { UsersSearchFilters } from "./UsersSearchFilters";
import { UsersTable } from "./UsersTable";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { UsersSkeleton } from "./UsersSkeleton";
import { useUsersManagement } from "@/hooks/useUsersManagement";
import type { SortKey } from "@/hooks/useUsersManagement";

export type { UserRow, SortKey, FilterVerified } from "@/hooks/useUsersManagement";

export function UsersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const urlSearch = searchParams.get('search') || '';
  const verified = searchParams.get('verified') || 'all';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortDirParam = searchParams.get('sortDir') || 'desc';

  const {
    users,
    total,
    totalPages,
    loading,
    error,
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
  } = useUsersManagement(page, urlSearch, verified, sortBy, sortDirParam);

  const [localSearch, setLocalSearch] = useState(urlSearch);

  useEffect(() => {
    setLocalSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== urlSearch) {
        const p = new URLSearchParams(searchParams.toString());
        p.set('search', localSearch);
        p.set('page', '1');
        router.replace(`${pathname}?${p.toString()}`);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const updateParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      p.set(key, value);
    } else {
      p.delete(key);
    }
    if (key !== 'page') p.set('page', '1');
    router.replace(`${pathname}?${p.toString()}`);
  }, [searchParams, pathname, router]);

  const handleSort = (key: SortKey) => {
    const currentSortBy = searchParams.get('sortBy') || 'createdAt';
    const currentSortDir = searchParams.get('sortDir') || 'desc';
    if (key === currentSortBy) {
      updateParam('sortDir', currentSortDir === 'asc' ? 'desc' : 'asc');
    } else {
      updateParam('sortBy', key);
      updateParam('sortDir', 'asc');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {loading && users.length === 0 ? (
        <UsersSkeleton />
      ) : error ? (
        <div className="p-8 text-center text-error border border-border-subtle rounded-2xl bg-white">
          {error}
        </div>
      ) : (
        <>
          <AdminHeaderPanel
            title="User Management"
            description="View and manage registered accounts, sessions, and authentication methods."
          />

          <UsersSearchFilters
            searchQuery={localSearch}
            onSearchChange={setLocalSearch}
            filterVerified={verified as any}
            onFilterChange={(val) => updateParam('verified', val)}
            onRefresh={fetchUsers}
            loading={loading}
          />

          <UsersTable
            users={users}
            total={total}
            loading={loading}
            sortKey={sortBy as SortKey}
            sortDir={sortDirParam as "asc" | "desc"}
            onSort={handleSort}
            onViewUser={setSelectedUser}
          />

          {totalPages > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => updateParam('page', String(p))}
            />
          )}
        </>
      )}

      <UserDetailModal
        user={selectedUser}
        sessions={sessions}
        sessionsLoading={sessionsLoading}
        onClose={() => setSelectedUser(null)}
        onToggleVerify={handleToggleVerify}
        onRoleChange={handleRoleChange}
        onDelete={(u) => {
          setSelectedUser(null);
          setConfirmDelete(u);
        }}
        isAdmin={isAdmin}
        updatingVerifyId={updatingVerify}
      />

      {confirmDelete && (
        <DeleteConfirmModal
          user={confirmDelete}
          deleting={deleting}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
