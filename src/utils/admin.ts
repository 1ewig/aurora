/**
 * Aurora — src/utils/admin.ts
 *
 * Server-only authorization helpers with role-based access control.
 * Each role has a numeric level — guards check that the user's level
 * meets the minimum required for the operation.
 *
 * Level hierarchy:  user=0, explorer=1, admin=10
 */

import { auth } from '@/lib/auth';
import { pool } from '@/utils/db';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const ROLE_LEVELS: Record<string, number> = {
  user: 0,
  admin: 10,
};

const UNAUTHORIZED = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const FORBIDDEN = NextResponse.json({ error: 'Forbidden' }, { status: 403 });

/**
 * Fetches the current session and verifies the user's role level meets
 * the required minimum. Queries the DB-backed `role` column.
 *
 * @param minLevel — minimum role level required (defaults to admin=10)
 */
export async function requireRole(
  minLevel: number = 10
): Promise<{ user: any; role: string; error?: NextResponse }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { user: null, role: 'user', error: UNAUTHORIZED };
    }

    const userResult = await pool.query(
      `SELECT role FROM better_auth."user" WHERE id = $1`,
      [session.user.id]
    );
    const role = userResult.rows[0]?.role || 'user';
    const level = ROLE_LEVELS[role] ?? 0;

    if (level < minLevel) {
      return { user: null, role, error: FORBIDDEN };
    }

    return { user: session.user, role };
  } catch (err) {
    console.error('requireRole error:', err);
    return {
      user: null,
      role: 'user',
      error: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    };
  }
}

/**
 * Convenience wrapper — requires admin level (default, used in mutation endpoints).
 */
export async function requireAdmin(): Promise<{ user: any; error?: NextResponse }> {
  const result = await requireRole(10);
  return { user: result.user, error: result.error };
}
