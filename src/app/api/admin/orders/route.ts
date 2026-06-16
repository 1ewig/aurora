/**
 * Aurora — src/app/api/admin/orders/route.ts
 *
 * GET /api/admin/orders — returns all orders for the admin panel.
 * Admin-only. Includes full order details with shipping info.
 */

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

    return NextResponse.json(orders);
  } catch (err) {
    console.error('Failed to list orders:', err);
    return NextResponse.json({ error: 'Failed to list orders' }, { status: 500 });
  }
}
