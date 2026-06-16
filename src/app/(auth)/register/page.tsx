/**
 * Aurora — src/app/(auth)/register/page.tsx
 *
 * Registration / sign-up page.
 */

import type { Metadata } from "next";
import { RegisterClient } from "@/components/auth/RegisterClient";

/** Metadata for the register page. */
export const metadata: Metadata = {
  title: "Create Profile — Aurora",
  description: "Join Aurora for a curated wardrobe experience.",
};

/** Registration / sign-up page. */
export default function RegisterPage() {
  return <RegisterClient />;
}
