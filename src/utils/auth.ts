import type { Profile } from "@/stores/useAuthStore";

export function normalizeProfile(data: any): Profile {
  return {
    displayName: data?.displayName || data?.profile?.displayName || "",
    bio: data?.bio || data?.profile?.bio || "",
  };
}
