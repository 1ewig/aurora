/**
 * Aurora — src/components/auth/AuthInitializer.tsx
 *
 * Server component that fetches the initial session and user role,
 * then renders AuthStoreInitializer to bootstrap the client store.
 */

import { connection } from "next/server";
import { getServerAuthUser } from "@/utils/admin";
import { AuthProvider } from "@/stores/useAuthStore";

interface AuthInitializerProps {
  children: React.ReactNode;
}

/** Server component to resolve session and initialize auth store. */
export async function AuthInitializer({ children }: AuthInitializerProps) {
  await connection();
  const initialUser = await getServerAuthUser();
  return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>;
}
