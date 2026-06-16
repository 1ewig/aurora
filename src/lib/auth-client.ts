/**
 * Aurora — src/lib/auth-client.ts
 *
 * Browser-side Better Auth client for login, register, logout, and session checks.
 */

import { createAuthClient } from 'better-auth/react';

/** Pre-configured Better Auth browser client. */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
});
