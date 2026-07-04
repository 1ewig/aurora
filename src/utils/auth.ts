/**
 * Aurora — src/utils/auth.ts
 *
 * Auth utility helpers: profile normalization and admin email checks.
 */

import type { Profile, User } from "@/stores/useAuthStore";

/** Normalizes a provider's raw profile data into a consistent Profile shape. */
export function normalizeProfile(data: any): Profile {
  return {
    displayName: data?.displayName || data?.profile?.displayName || data?.nickname || data?.name || "",
  };
}

/** Fetches the current user's role from the server with a safe fallback. */
export async function fetchUserRole(): Promise<{ isAdmin: boolean; role: string }> {
  const roleRes = await fetch("/api/auth/role").catch(() => null);
  return roleRes?.ok ? roleRes.json() : { isAdmin: false, role: "user" };
}

/** Builds store-compatible user + profile state from a Better Auth session user. */
export function buildUserState(
  sessionUser: {
    id: string;
    email: string;
    name?: string | null;
    emailVerified?: boolean | null;
    image?: string | null;
  },
  role: { isAdmin: boolean; role: string }
): { user: User; profile: Profile } {
  return {
    user: {
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name ?? "",
      emailVerified: sessionUser.emailVerified ?? false,
      image: sessionUser.image ?? "",
      isAdmin: role.isAdmin ?? false,
      role: role.role ?? "user",
    },
    profile: normalizeProfile({ displayName: sessionUser.name || "" }),
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

