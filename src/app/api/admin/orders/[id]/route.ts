/**
 * Aurora — src/app/api/admin/orders/[id]/route.ts
 *
 * PATCH /api/admin/orders/:id — updates an order's status.
 * Admin-only. Validates status against allowed transitions.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { isAdmin } from '@/utils/auth';

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2
       RETURNING id, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: result.rows[0] });
  } catch (err: any) {
    console.error('Failed to update order status:', err);
    return NextResponse.json({ error: err.message || 'Failed to update order status' }, { status: 500 });
  }
}
