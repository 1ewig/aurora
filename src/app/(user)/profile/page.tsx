/**
 * Aurora — src/app/(user)/profile/page.tsx
 *
 * Profile settings page displaying user account details.
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
