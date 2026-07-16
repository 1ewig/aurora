/**
 * Aurora — src/app/api/admin/dashboard/route.ts
 *
 * GET /api/admin/dashboard — returns aggregate metrics and recent orders.
 * Admin-only. Requires authentication and admin role.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { requireAdmin } from '@/utils/admin';

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

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
          is_paid as "isPaid",
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
  } catch (err: any) {
    if (
      (err instanceof Error &&
       (err.message.includes('prerendering') ||
        err.name === 'DynamicServerError' ||
        err.message.includes('DynamicServerError') ||
        err.message.includes('dynamic-server'))) ||
      (err &&
       ((err as any).digest === 'DYNAMIC_SERVER_USAGE' ||
        (err as any).digest === 'HANGING_PROMISE_REJECTION'))
    ) {
      throw err;
    }
    console.error('Failed to load dashboard metrics:', err);
    return NextResponse.json({ error: 'Failed to load dashboard metrics' }, { status: 500 });
  }
}
