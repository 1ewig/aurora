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
import { logAudit } from '@/utils/audit';
import { rethrowIfDynamicServerError } from '@/utils/errors';

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
      `SELECT id, name, email, "emailVerified", image, role, "createdAt", "updatedAt"
       FROM better_auth."user" WHERE id = $1`,
      [id]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(userResult.rows[0]);
  } catch (err: unknown) {
    rethrowIfDynamicServerError(err);
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
    const allowedFields = ['name', 'emailVerified', 'role'] as const;
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if ('role' in body && !['user', 'admin'].includes(body.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'emailVerified') {
          updates.push(`"emailVerified" = $${idx}`);
          values.push(body[field] === true || body[field] === 'true');
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

    const changedFields = Object.keys(body).filter(k => allowedFields.includes(k as any));
    const oldResult = await pool.query(
      `SELECT name, email, "emailVerified", role FROM better_auth."user" WHERE id = $1`,
      [id]
    );
    if (oldResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const oldUser = oldResult.rows[0];

    updates.push(`"updatedAt" = timezone('utc'::text, now())`);

    const result = await pool.query(
      `UPDATE better_auth."user" SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, "emailVerified", "createdAt", "updatedAt"`,
      [...values, id]
    );

    const changes: Record<string, { from: any; to: any }> = {};
    for (const field of changedFields) {
      const dbField = field === 'emailVerified' ? 'emailVerified' : field;
      const oldVal = oldUser[dbField];
      const newVal = field === 'emailVerified' ? (body[field] === true || body[field] === 'true') : body[field];
      if (String(oldVal) !== String(newVal)) {
        changes[field] = { from: oldVal, to: newVal };
      }
    }

    const { user } = await requireAdmin();
    await logAudit({
      adminId: user.id,
      adminEmail: user.email,
      action: 'user.update',
      targetType: 'user',
      targetId: id,
      metadata: { fields: changedFields, changes },
    });

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    rethrowIfDynamicServerError(err);
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

    const { email: deletedEmail, name: deletedName } = result.rows[0];
    await logAudit({
      adminId: user.id,
      adminEmail: user.email,
      action: 'user.delete',
      targetType: 'user',
      targetId: id,
      metadata: { email: deletedEmail, name: deletedName },
    });

    return NextResponse.json({ deleted: result.rows[0] });
  } catch (err) {
    rethrowIfDynamicServerError(err);
    console.error('Failed to delete user:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
