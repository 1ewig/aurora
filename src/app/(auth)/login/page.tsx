/**
 * Aurora — src/app/(auth)/login/page.tsx
 *
 * Sign-in page (server component). Delegates to LoginClient which
 * renders the email/password form and calls useAuthStore.signIn().
 *
 * robots: noindex — auth pages should not appear in search results.
 */

import type { Metadata } from "next";
import { LoginClient } from "@/components/auth/LoginClient";

/** Metadata for the login page. */
export const metadata: Metadata = {
  title: "Access Profile — Aurora",
  description: "Sign in with your email and password to access your wardrobe.",
  robots: {
    index: false,
    follow: false,
  },
};

/** Login / sign-in page. */
export default function LoginPage() {
  return <LoginClient />;
}
