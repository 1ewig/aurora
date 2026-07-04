/**
 * Aurora — src/app/(auth)/verify/page.tsx
 *
 * Email verification page.
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
