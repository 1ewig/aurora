/**
 * Aurora — src/utils/admin.ts
 *
 * Server-only admin authorization helpers.
 * Centralizes session verification, DB role lookup, and isAdmin check
 * so individual route files don't need to repeat the pattern.
 */

import { auth } from '@/lib/auth';
import { pool } from '@/utils/db';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/utils/auth';

/**
 * Fetches the current session and verifies the user has an admin role.
 * Queries the DB-backed `role` column on `better_auth."user"`.
 *
 * Returns the user object on success, or a 401/500 NextResponse on failure.
 */
export async function requireAdmin(): Promise<{
  user: any;
  error?: NextResponse;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        user: null,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    const userResult = await pool.query(
      `SELECT role FROM better_auth."user" WHERE id = $1`,
      [session.user.id]
    );
    const role = userResult.rows[0]?.role || 'user';

    if (!isAdmin(session.user.email, role)) {
      return {
        user: null,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    return { user: session.user };
  } catch (err) {
    console.error('requireAdmin error:', err);
    return {
      user: null,
      error: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    };
  }
}
