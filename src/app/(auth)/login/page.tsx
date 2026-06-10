import type { Metadata } from "next";
import { LoginClient } from "@/components/auth/LoginClient";

export const metadata: Metadata = {
  title: "Access Profile — Aurora",
  description: "Sign in with your email and password to access your wardrobe.",
};

export default function LoginPage() {
  return <LoginClient />;
}
