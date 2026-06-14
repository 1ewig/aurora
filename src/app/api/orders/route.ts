import { NextResponse } from "next/server";
import { pool } from "@/utils/db";
import { createServerInsforge } from "@/utils/insforge/server";

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(100000 + Math.random() * 900000);
  return `AUR-${year}-${num}`;
}

export async function GET() {
  try {
    const insforge = await createServerInsforge();
    const { data, error } = await insforge.auth.getCurrentUser();

    if (error || !data?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `SELECT id, user_id, order_number, items, subtotal, shipping, tax, total, shipping_address, status, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [data.user.id]
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
      createdAt: row.created_at,
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (typeof item.price !== "number" || item.price < 0 || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json(
          { error: "Invalid item data" },
          { status: 400 }
        );
      }
    }

    const email = shippingAddress.email;
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const insforge = await createServerInsforge();
    const { data } = await insforge.auth.getCurrentUser();
    const userId = data?.user?.id ?? null;

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + shipping + tax;

    const orderNumber = generateOrderNumber();

    const result = await pool.query(
      `INSERT INTO orders (user_id, order_number, items, subtotal, shipping, tax, total, shipping_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING id, order_number, created_at`,
      [
        userId,
        orderNumber,
        JSON.stringify(items),
        subtotal,
        shipping,
        tax,
        total,
        JSON.stringify(shippingAddress),
      ]
    );

    const order = result.rows[0];

    return NextResponse.json({
      id: order.id,
      orderNumber: order.order_number,
      createdAt: order.created_at,
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}
