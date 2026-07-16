/**
 * Aurora — src/app/api/orders/route.ts
 *
/**
 * Aurora — src/app/api/orders/route.ts
 *
 * Order API — GET returns the current user's orders.
 */

import { NextResponse } from "next/server";
import { pool } from "@/utils/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lsOrderId = searchParams.get("lsOrderId");

    if (lsOrderId) {
      const result = await pool.query(
        "SELECT order_number FROM orders WHERE ls_order_id = $1",
        [lsOrderId]
      );

      if ((result.rowCount ?? 0) === 0) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ orderNumber: result.rows[0].order_number });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const offset = Number(searchParams.get("offset")) || 0;

    const countRes = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE user_id = $1",
      [session.user.id]
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const result = await pool.query(
      `SELECT id, user_id, order_number, items, subtotal, shipping, tax, total, shipping_address, status, is_paid, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [session.user.id, limit, offset]
    );

    const orders = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      orderNumber: row.order_number,
      items: row.items,
      subtotal: Number(row.subtotal),
      shipping: Number(row.shipping),
      tax: Number(row.tax),
      total: Number(row.total),
      shippingAddress: row.shipping_address,
      status: row.status,
      isPaid: row.is_paid,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ orders, total });
  } catch (error: any) {
    if (
      (error instanceof Error &&
       (error.message.includes('prerendering') ||
        error.name === 'DynamicServerError' ||
        error.message.includes('DynamicServerError') ||
        error.message.includes('dynamic-server'))) ||
      (error &&
       ((error as any).digest === 'DYNAMIC_SERVER_USAGE' ||
        (error as any).digest === 'HANGING_PROMISE_REJECTION'))
    ) {
      throw error;
    }
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
