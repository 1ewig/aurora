import type { Metadata } from "next";
import { ProfileLayoutClient } from "./ProfileLayoutClient";

export const metadata: Metadata = {
  title: "Your Profile — Aurora",
  description: "Manage your Aurora account credentials and wardrobe preferences.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileLayoutClient>{children}</ProfileLayoutClient>;
}
