/**
 * Aurora — src/app/(auth)/reset-password/page.tsx
 *
 * Password reset page.
 */

import type { Metadata } from "next";
import { ResetPasswordClient } from "@/components/auth/ResetPasswordClient";

/** Metadata for the reset-password page. */
export const metadata: Metadata = {
  title: "Reset Password — Aurora",
  description: "Update your password to secure your account.",
};

/** Password reset page. */
export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
