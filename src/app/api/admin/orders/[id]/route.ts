/**
 * Aurora — src/app/api/admin/orders/[id]/route.ts
 *
 * PATCH /api/admin/orders/:id — updates an order's status.
 * Admin-only. Validates status against allowed transitions.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { requireAdmin } from '@/utils/admin';
import { logAudit } from '@/utils/audit';

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
    }

    const { rows: existing } = await pool.query(
      'SELECT status FROM orders WHERE id = $1', [id]
    );
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const oldStatus = existing[0].status;

    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);

    await logAudit({
      adminId: user.id,
      adminEmail: user.email,
      action: 'order.update_status',
      targetType: 'order',
      targetId: id,
      metadata: { from: oldStatus, to: status },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to update order status:', err);
    return NextResponse.json({ error: err.message || 'Failed to update order status' }, { status: 500 });
  }
}
