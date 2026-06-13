import type { Metadata } from "next";
import { VerifyClient } from "@/components/auth/VerifyClient";

export const metadata: Metadata = {
  title: "Verify Account — Aurora",
  description: "Verify your email address to active your account.",
};

export default function VerifyPage() {
  return <VerifyClient />;
}
