/**
 * Aurora — src/app/api/admin/audit/route.ts
 *
 * GET /api/admin/audit — returns paginated audit log entries.
 * Admin-only. Supports cursor-based pagination via offset/limit query params.
 */

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { requireAdmin } from '@/utils/admin';
import { rethrowIfDynamicServerError } from '@/utils/errors';

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;
    const targetType = searchParams.get('targetType') || '';
    const action = searchParams.get('action') || '';
    const search = searchParams.get('search') || '';

    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (targetType) {
      conditions.push(`target_type = $${idx++}`);
      params.push(targetType);
    }
    if (action) {
      conditions.push(`action = $${idx++}`);
      params.push(action);
    }
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        `(action ILIKE $${idx} OR target_type ILIKE $${idx} OR target_id ILIKE $${idx} OR admin_email ILIKE $${idx})`
      );
      params.push(searchPattern);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM audit_logs ${where}`, params);
    const total = Number(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, admin_id, admin_email, action, target_type, target_id, metadata, created_at
       FROM audit_logs ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      logs: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: unknown) {
    rethrowIfDynamicServerError(err);
    console.error('Failed to fetch audit logs:', err);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
