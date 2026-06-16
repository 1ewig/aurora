/**
 * Aurora — src/app/api/admin/dashboard/route.ts
 *
 * GET /api/admin/dashboard — returns aggregate metrics and recent orders.
 * Admin-only. Requires authentication and admin role.
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

    const statsPromises = [
      pool.query(`
        SELECT
          COALESCE(SUM(total), 0) as "totalSales",
          COUNT(id) as "totalOrders"
        FROM orders
        WHERE status <> 'cancelled'
      `),
      pool.query(`
        SELECT COUNT(id) as "pendingCount"
        FROM orders
        WHERE status = 'pending'
      `),
      pool.query(`
        SELECT COUNT(id) as "shippedCount"
        FROM orders
        WHERE status = 'shipped'
      `),
      pool.query(`
        SELECT COUNT(*) as "lowStockCount"
        FROM (
          SELECT DISTINCT product_id
          FROM product_sizes
          WHERE stock < 5
        ) as low_stock
      `),
      pool.query(`
        SELECT
          order_number as "orderNumber",
          total,
          status,
          created_at as "createdAt",
          shipping_address->>'firstName' as "firstName",
          shipping_address->>'lastName' as "lastName"
        FROM orders
        ORDER BY created_at DESC
        LIMIT 5
      `),
    ];

    const [salesRes, pendingRes, shippedRes, stockRes, recentRes] = await Promise.all(statsPromises);

    const totalSales = Number(salesRes.rows[0].totalSales);
    const totalOrders = Number(salesRes.rows[0].totalOrders);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const pendingCount = Number(pendingRes.rows[0].pendingCount);
    const shippedCount = Number(shippedRes.rows[0].shippedCount);
    const lowStockCount = Number(stockRes.rows[0].lowStockCount);

    const recentOrders = recentRes.rows.map(row => ({
      ...row,
      total: Number(row.total),
    }));

    return NextResponse.json({
      metrics: {
        totalSales,
        totalOrders,
        averageOrderValue,
        pendingCount,
        shippedCount,
        lowStockCount,
      },
      recentOrders,
    });
  } catch (err) {
    console.error('Failed to load dashboard metrics:', err);
    return NextResponse.json({ error: 'Failed to load dashboard metrics' }, { status: 500 });
  }
}
