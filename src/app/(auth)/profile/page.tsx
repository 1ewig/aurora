import type { Metadata } from "next";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Your Profile — Aurora",
  description: "Customize your display profile and account specifications for the Aurora collection.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
