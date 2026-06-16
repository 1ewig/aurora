/**
 * Aurora — src/app/(user)/profile/layout.tsx
 *
 * Profile layout wrapper providing the sidebar shell for profile sub-pages.
 */

import type { Metadata } from "next";
import { ProfileLayoutClient } from "./ProfileLayoutClient";

/** Metadata for the profile layout. */
export const metadata: Metadata = {
  title: "Your Profile — Aurora",
  description: "Manage your Aurora account credentials and wardrobe preferences.",
};

/** Profile layout wrapping authenticated user sub-pages with a sidebar shell. */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileLayoutClient>{children}</ProfileLayoutClient>;
}
