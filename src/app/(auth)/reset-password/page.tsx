import type { Metadata } from "next";
import { ResetPasswordClient } from "@/components/auth/ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password — Aurora",
  description: "Update your password to secure your account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
