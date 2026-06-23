/**
 * Aurora — src/app/api/admin/users/[id]/route.ts
 *
 * GET /api/admin/users/:id — returns user details or sessions (with ?include=sessions).
 * PATCH /api/admin/users/:id — updates allowed user fields.
 * DELETE /api/admin/users/:id — deletes a user (self-deletion blocked).
 * Admin-only endpoints.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { requireAdmin } from '@/utils/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await requireAdmin();
    if (error) return error;

    const url = new URL(request.url);
    const include = url.searchParams.get('include');

    if (include === 'sessions') {
      const result = await pool.query(
        `SELECT id, "userId", "expiresAt", "createdAt", "ipAddress", "userAgent"
         FROM better_auth."session"
         WHERE "userId" = $1
         ORDER BY "createdAt" DESC
         LIMIT 50`,
        [id]
      );
      return NextResponse.json({ sessions: result.rows });
    }

    const userResult = await pool.query(
      `SELECT id, name, email, "emailVerified", image, "createdAt", "updatedAt"
       FROM better_auth."user" WHERE id = $1`,
      [id]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(userResult.rows[0]);
  } catch (err) {
    console.error('Failed to get user:', err);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const allowedFields = ['name', 'emailVerified'] as const;
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'emailVerified') {
          updates.push(`"emailVerified" = $${idx}`);
          values.push(body[field] === true);
        } else {
          updates.push(`"${field}" = $${idx}`);
          values.push(body[field]);
        }
        idx++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updates.push(`"updatedAt" = timezone('utc'::text, now())`);

    const result = await pool.query(
      `UPDATE better_auth."user" SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, "emailVerified", "createdAt", "updatedAt"`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error('Failed to update user:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error } = await requireAdmin();
    if (error) return error;

    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const result = await pool.query(
      `DELETE FROM better_auth."user" WHERE id = $1 RETURNING id, email, name`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ deleted: result.rows[0] });
  } catch (err) {
    console.error('Failed to delete user:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
