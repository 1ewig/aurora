/**
 * Aurora — src/app/(auth)/reset-password/page.tsx
 *
 * Password reset page (server component). Delegates to ResetPasswordClient
 * which handles two flows:
 *  1. Request a reset email (email input + submit).
 *  2. Set a new password (token from URL + new password input).
 *
 * The token is passed via query string (?token=...) after the user clicks
 * the link in the reset email sent by Better Auth.
 *
 * robots: noindex — auth pages should not appear in search results.
 */

import type { Metadata } from "next";
import { ResetPasswordClient } from "@/components/auth/ResetPasswordClient";

/** Metadata for the reset-password page. */
export const metadata: Metadata = {
  title: "Reset Password — Aurora",
  description: "Update your password to secure your account.",
  robots: {
    index: false,
    follow: false,
  },
};

/** Password reset page. */
export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
