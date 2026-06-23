/**
 * Aurora — src/utils/auth.ts
 *
 * Auth utility helpers: profile normalization and admin email checks.
 */

import type { Profile } from "@/stores/useAuthStore";

/** Normalizes a provider's raw profile data into a consistent Profile shape. */
export function normalizeProfile(data: any): Profile {
  return {
    displayName: data?.displayName || data?.profile?.displayName || data?.nickname || data?.name || "",
  };
}

/** Checks whether a user is an admin.
 *
 *  Priority order:
 *  1. DB-backed `role` column (from `better_auth."user"`) when provided
 *  2. Legacy `ADMIN_EMAILS` env-var whitelist (backward compat during migration)
 */
export function isAdmin(email?: string, role?: string): boolean {
  if (role) return role === 'admin';
  if (!email) return false;
  const adminEmailsStr = process.env.ADMIN_EMAILS || "";
  const adminEmails = adminEmailsStr.split(",").map((e) => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

