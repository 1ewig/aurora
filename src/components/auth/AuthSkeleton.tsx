/**
 * Aurora — src/components/auth/AuthSkeleton.tsx
 *
 * Loading skeleton for auth pages (login, register, reset-password, verify).
 * Shared between page-level loading.tsx and client-side loading states.
 */

export function AuthSkeleton() {
  return (
    <div className="min-h-[90vh] md:min-h-screen bg-bg-primary pt-12 pb-12 px-6 flex flex-col items-center justify-center animate-pulse">
      {/* Back link placeholder */}
      <div className="w-full max-w-[440px] mb-4">
        <div className="h-4 w-24 bg-bg-secondary rounded" />
      </div>

      {/* Form card skeleton */}
      <div className="w-full max-w-[440px] bg-bg-secondary border border-border-subtle p-8 md:p-10 rounded-[24px] shadow-sm space-y-6">
        <div className="text-center space-y-2 mb-6">
          <div className="h-8 w-48 bg-bg-primary rounded mx-auto" />
          <div className="h-4 w-64 bg-bg-primary rounded mx-auto" />
        </div>

        <div className="space-y-2">
          <div className="h-3 w-20 bg-bg-primary rounded" />
          <div className="h-12 w-full bg-bg-primary rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="h-3 w-16 bg-bg-primary rounded" />
          <div className="h-12 w-full bg-bg-primary rounded-full" />
        </div>

        <div className="h-12 w-full bg-bg-primary rounded-full" />
      </div>
    </div>
  );
}
