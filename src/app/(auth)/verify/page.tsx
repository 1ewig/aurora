/**
 * Aurora — src/app/(auth)/verify/page.tsx
 *
 * Email verification page (server component). Delegates to VerifyClient
 * which handles the verification flow triggered by the link sent in the
 * Better Auth verification email. The token and email are read from the
 * URL query string (?token=...&email=...).
 *
 * robots: noindex — auth pages should not appear in search results.
 */

import type { Metadata } from "next";
import { VerifyClient } from "@/components/auth/VerifyClient";

/** Metadata for the verify page. */
export const metadata: Metadata = {
  title: "Verify Account — Aurora",
  description: "Verify your email address to active your account.",
  robots: {
    index: false,
    follow: false,
  },
};

/** Email verification page. */
export default function VerifyPage() {
  return <VerifyClient />;
}
