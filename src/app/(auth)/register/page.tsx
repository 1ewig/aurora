import type { Metadata } from "next";
import { RegisterClient } from "@/components/auth/RegisterClient";

export const metadata: Metadata = {
  title: "Create Profile — Aurora",
  description: "Join Aurora for a curated wardrobe experience.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
