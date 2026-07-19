/**
 * Aurora — src/app/(user)/profile/page.tsx
 *
 * User profile settings page (server component). Delegates to ProfileClient
 * which renders the edit form for display name, email, and password change.
 *
 * Auth is guaranteed by the parent (user)/layout.tsx gate.
 * robots: noindex — user account pages should not appear in search results.
 */

import type { Metadata } from "next";
import { ProfileClient } from "@/components/profile/ProfileClient";

/** Metadata for the profile page. */
export const metadata: Metadata = {
  title: "Your Profile — Aurora",
  description: "Customize your display profile and account specifications for the Aurora collection.",
  robots: {
    index: false,
    follow: false,
  },
};

/** Profile settings page. */
export default function ProfilePage() {
  return <ProfileClient />;
}
