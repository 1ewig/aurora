/**
 * Aurora — src/app/(user)/layout.tsx
 *
 * Thin server component layout for user account pages.
 * Auth gating is delegated to the client wrapper.
 */

import type { Metadata } from "next";
import { UserLayoutClient } from "./UserLayoutClient";

/** Metadata for user routes. Prevent search indexing. */
export const metadata: Metadata = {
  title: "My Account — Aurora",
  description: "Manage your Aurora profile and orders.",
  robots: {
    index: false,
    follow: false,
  },
};

/** Auth-gated layout that delegates to the client wrapper. */
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
