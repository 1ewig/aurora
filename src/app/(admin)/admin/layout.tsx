"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/ui/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-sm text-text-secondary">
        Authenticating administrative session...
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-12 lg:p-16 max-w-[1400px]">
        {children}
      </main>
    </div>
  );
}
