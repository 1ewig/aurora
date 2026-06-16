/**
 * Aurora — src/app/(auth)/login/page.tsx
 *
 * Login / sign-in page.
 */

import type { Metadata } from "next";
import { LoginClient } from "@/components/auth/LoginClient";

/** Metadata for the login page. */
export const metadata: Metadata = {
  title: "Access Profile — Aurora",
  description: "Sign in with your email and password to access your wardrobe.",
};

/** Login / sign-in page. */
export default function LoginPage() {
  return <LoginClient />;
}
