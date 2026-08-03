/**
 * Aurora — src/app/api/insforge-token/route.ts
 *
 * GET /api/insforge-token — returns a signed JWT for the InsForge bridge,
 * allowing the browser client to authenticate with InsForge services.
 */

import { requireAdmin } from '@/utils/admin';
import jwt from 'jsonwebtoken';
import { requireEnv } from '@/utils/env';
import { NextResponse } from 'next/server';

export async function GET() {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const token = jwt.sign(
    {
      sub: user.id,
      role: 'admin',
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
