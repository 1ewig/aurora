/**
 * Aurora — src/app/(user)/profile/layout.tsx
 *
 * Profile sub-layout (server component). Nested inside (user)/layout.tsx,
 * this provides the sidebar + workspace layout for profile sub-pages
 * (currently: profile settings and order history).
 *
 * ProfileLayoutClient manages the sidebar navigation (links, active state)
 * and renders the child page in the right-hand workspace area.
 * Auth is already guaranteed by the parent (user)/layout.tsx gate.
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
