import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { isAdmin } from '@/utils/auth';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u."emailVerified" AS "emailVerified",
        u.image,
        u."createdAt" AS "createdAt",
        u."updatedAt" AS "updatedAt",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', a.id,
            'providerId', a."providerId",
            'createdAt', a."createdAt"
          )) FILTER (WHERE a.id IS NOT NULL),
          '[]'::json
        ) AS accounts,
        (SELECT COUNT(*)::int FROM better_auth."session" s WHERE s."userId" = u.id) AS "sessionCount",
        (SELECT MAX(s."createdAt") FROM better_auth."session" s WHERE s."userId" = u.id) AS "lastSessionAt"
      FROM better_auth."user" u
      LEFT JOIN better_auth."account" a ON a."userId" = u.id
      GROUP BY u.id
      ORDER BY u."createdAt" DESC
    `);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Failed to list users:', err);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}
