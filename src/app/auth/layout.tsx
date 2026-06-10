import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication — Aurora",
  description: "Access your personalized Aurora wardrobe profile.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
