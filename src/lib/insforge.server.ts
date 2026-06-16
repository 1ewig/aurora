/**
 * Aurora — src/lib/insforge.server.ts
 *
 * Server-side InsForge SDK factory for API routes.
 * Signs a JWT using the Better Auth session so the client can authenticate
 * with InsForge edge functions and storage.
 */

import { createClient } from '@insforge/sdk';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

/** Reads a required env var or throws. */
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/** Creates an authenticated InsForge client for the current user session. Returns null if unauthenticated. */
export async function createInsforgeClient() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

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
