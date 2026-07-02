/**
 * Aurora — src/app/api/admin/orders/route.ts
 *
 * GET /api/admin/orders — returns all orders for the admin panel.
 * Admin-only. Includes full order details with shipping info.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { requireAdmin } from '@/utils/admin';

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const result = await pool.query(`
      SELECT
        id,
        user_id as "userId",
        order_number as "orderNumber",
        items,
        subtotal,
        shipping,
        tax,
        total,
        shipping_address as "shippingAddress",
        status,
        is_paid as "isPaid",
        created_at as "createdAt"
      FROM orders
      ORDER BY created_at DESC
    `);

    const orders = result.rows.map(row => ({
      ...row,
      subtotal: Number(row.subtotal),
      shipping: Number(row.shipping),
      tax: Number(row.tax),
      total: Number(row.total),
    }));

    const allItemIds = [...new Set(orders.flatMap(o => (o.items as any[]).map(i => i.id)))];
    if (allItemIds.length > 0) {
      const imgResult = await pool.query(
        `SELECT id, image FROM products WHERE id = ANY($1)`,
        [allItemIds]
      );
      const imageMap = Object.fromEntries(
        imgResult.rows.map(r => [r.id, r.image])
      );
      for (const order of orders) {
        for (const item of order.items as any[]) {
          if (imageMap[item.id]) {
            item.image = imageMap[item.id];
          }
        }
      }
    }

    return NextResponse.json(orders);
  } catch (err) {
    console.error('Failed to list orders:', err);
    return NextResponse.json({ error: 'Failed to list orders' }, { status: 500 });
  }
}
