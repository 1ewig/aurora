import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile — Aurora",
  description: "Manage your Aurora account credentials and wardrobe preferences.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
