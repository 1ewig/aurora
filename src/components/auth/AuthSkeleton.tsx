/**
 * Aurora — src/components/auth/AuthSkeleton.tsx
 *
 * Loading component for auth pages (login, register, reset-password, verify).
 * Renders an elegant luxury loading spinner instead of a block skeleton.
 */

export function AuthSkeleton() {
  return (
    <div className="min-h-[80vh] md:min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary font-medium animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}
