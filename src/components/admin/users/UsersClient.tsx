/**
 * Aurora — src/components/admin/users/UsersClient.tsx
 *
 * User management page — hosts subcomponents and passes down hook state.
 */

"use client";

import { AdminHeaderPanel } from "@/components/ui/AdminHeaderPanel";
import { UserDetailModal } from "./UserDetailModal";
import { UsersSearchFilters } from "./UsersSearchFilters";
import { UsersTable } from "./UsersTable";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { UsersSkeleton } from "./UsersSkeleton";
import { useUsersManagement } from "@/hooks/useUsersManagement";

// Re-export UserRow so that UserDetailModal (and others) can import it from here.
export type { UserRow, SortKey, FilterVerified } from "@/hooks/useUsersManagement";

/** User management page container. */
export function UsersClient() {
  const {
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
  } = useUsersManagement();

  return (
    <div className="space-y-8 pb-12">
      <AdminHeaderPanel
        title="User Management"
        description="View and manage registered accounts, sessions, and authentication methods."
      />

      <UsersSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterVerified={filterVerified}
        onFilterChange={setFilterVerified}
        onRefresh={fetchUsers}
        loading={loading}
      />

      {loading && users.length === 0 ? (
        <UsersSkeleton />
      ) : error ? (
        <div className="p-8 text-center text-error border border-border-subtle rounded-2xl bg-white">
          {error}
        </div>
      ) : (
        <UsersTable
          users={users}
          filteredUsers={filteredUsers}
          loading={loading}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={toggleSort}
          onViewUser={setSelectedUser}
        />
      )}

      {/* Detail Modal */}
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

      {/* Delete Confirmation */}
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
