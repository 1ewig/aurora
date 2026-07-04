/**
 * Aurora — src/app/api/insforge-token/route.ts
 *
 * GET /api/insforge-token — returns a signed JWT for the InsForge bridge,
 * allowing the browser client to authenticate with InsForge services.
 */

import { auth } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { requireEnv } from '@/utils/env';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'not signed in' }, { status: 401 });
  }

  const token = jwt.sign(
    {
      sub: session.user.id,
      role: 'authenticated',
      aud: 'insforge-api',
    },
    requireEnv('INSFORGE_JWT_SECRET'),
    { algorithm: 'HS256', expiresIn: '1h' },
  );

  return NextResponse.json(
    { token },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
