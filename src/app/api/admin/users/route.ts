/**
 * Aurora — src/app/api/admin/users/route.ts
 *
 * GET /api/admin/users — returns all users with account links and session metadata.
 * Admin-only.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { requireAdmin } from '@/utils/admin';

const SORT_MAP: Record<string, string> = {
  name: 'u.name',
  email: 'u.email',
  emailVerified: 'u."emailVerified"',
  createdAt: 'u."createdAt"',
  sessionCount: '"sessionCount"',
};

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const verified = searchParams.get('verified') || '';
    const sortBy = SORT_MAP[searchParams.get('sortBy') || 'createdAt'] || 'u."createdAt"';
    const sortDir = searchParams.get('sortDir') === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (verified === 'verified') {
      conditions.push(`u."emailVerified" = TRUE`);
    } else if (verified === 'unverified') {
      conditions.push(`u."emailVerified" = FALSE`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u."emailVerified" AS "emailVerified",
        u.image,
        u.role,
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
        (SELECT MAX(s."createdAt") FROM better_auth."session" s WHERE s."userId" = u.id) AS "lastSessionAt",
        COUNT(*) OVER() AS total
      FROM better_auth."user" u
      LEFT JOIN better_auth."account" a ON a."userId" = u.id
      ${whereClause}
      GROUP BY u.id
      ORDER BY ${sortBy} ${sortDir}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, limit, offset]);

    const total = result.rows.length > 0 ? Number(result.rows[0].total) : 0;

    return NextResponse.json({
      users: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Failed to list users:', err);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}
