import type { Profile } from "@/stores/useAuthStore";

export function normalizeProfile(data: any): Profile {
  return {
    displayName: data?.displayName || data?.profile?.displayName || data?.nickname || data?.name || "",
  };
}

export function isAdmin(email?: string): boolean {
  if (!email) return false;
  const adminEmailsStr = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  const adminEmails = adminEmailsStr.split(",").map((e) => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

