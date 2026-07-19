/**
 * Aurora — src/lib/insforge.server.ts
 *
 * Server-side InsForge SDK factory for API routes.
 * Signs a JWT with the user's identity claims (sub, role, aud) using
 * INSFORGE_JWT_SECRET, then creates an authenticated InsForge client
 * with the token as an edgeFunctionToken.
 *
 * Returns null if no session exists (unauthenticated callers get an
 * anon client with limited RLS access).
 *
 * The JWT is signed with HS256 and expires in 1 hour.
 */

import { createClient } from '@insforge/sdk';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { requireEnv } from '@/utils/env';
import jwt from 'jsonwebtoken';

/** Creates an authenticated InsForge client for the current user session. Returns null if unauthenticated. */
export async function createInsforgeClient() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  /*
   * Sign a JWT with the user's ID as the subject, 'authenticated' role,
   * and 'insforge-api' audience. This token is verified by the InsForge
   * gateway to grant the client access to storage and edge functions
   * with RLS policies that match on auth.jwt() -> 'sub'.
   */
  const insforgeToken = jwt.sign(
    {
      sub: session.user.id,
      role: 'authenticated',
      aud: 'insforge-api',
    },
    requireEnv('INSFORGE_JWT_SECRET'),
    { algorithm: 'HS256', expiresIn: '1h' },
  );

  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    edgeFunctionToken: insforgeToken,
  });
}
