/**
 * Aurora — src/app/(user)/layout.tsx
 *
 * User account layout (server component). Wraps all authenticated user
 * pages (profile, orders) in the UserLayoutClient, which performs the
 * auth gate: if no session exists, the client redirects to /login.
 *
 * This prevents unauthenticated access at the layout level rather than
 * requiring each sub-page to check auth individually.
 *
 * robots metadata blocks search indexing for all user account routes.
 */

import type { Metadata } from "next";
import { UserLayoutClient } from "./UserLayoutClient";
import { getServerAuthUser } from "@/utils/admin";
import { redirect } from "next/navigation";

/** Metadata for user routes. Prevent search indexing. */
export const metadata: Metadata = {
  title: "My Account — Aurora",
  description: "Manage your Aurora profile and orders.",
  robots: {
    index: false,
    follow: false,
  },
};

/** Auth-gated layout that verifies session server-side then delegates to the client wrapper. */
export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerAuthUser();
  if (!user) {
    redirect("/login");
  }

  return <UserLayoutClient>{children}</UserLayoutClient>;
}
