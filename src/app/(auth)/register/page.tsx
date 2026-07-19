/**
 * Aurora — src/app/(auth)/register/page.tsx
 *
 * Account registration page (server component). Delegates to RegisterClient
 * which renders the sign-up form and calls useAuthStore.signUp().
 *
 * robots: noindex — auth pages should not appear in search results.
 */

import type { Metadata } from "next";
import { RegisterClient } from "@/components/auth/RegisterClient";

/** Metadata for the register page. */
export const metadata: Metadata = {
  title: "Create Profile — Aurora",
  description: "Join Aurora for a curated wardrobe experience.",
  robots: {
    index: false,
    follow: false,
  },
};

/** Registration / sign-up page. */
export default function RegisterPage() {
  return <RegisterClient />;
}
