"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

export function ProfileLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-bg-primary">
      {/* Sidebar on the left */}
      <aside className="w-full lg:w-64 lg:h-screen lg:sticky lg:top-0 border-b lg:border-b-0 lg:border-r border-border-subtle bg-bg-secondary flex flex-col shrink-0">
        <ProfileSidebar />
      </aside>

      {/* Main content area on the right */}
      <div className="flex-1 min-h-screen p-6 sm:p-8 md:p-12 lg:p-16 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
