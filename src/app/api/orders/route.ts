import { NextResponse } from "next/server";
import { pool } from "@/utils/db";
import { insforge } from "@/utils/insforge";

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(100000 + Math.random() * 900000);
  return `AUR-${year}-${num}`;
}

export async function GET() {
  try {
    const { data } = await insforge.auth.getCurrentUser();
    const user = data?.user ?? null;

    if (!user) {
      return NextResponse.json([]);
    }

    const result = await pool.query(
      `SELECT id, user_id, guest_email, order_number, items, subtotal, shipping, tax, total, shipping_address, status, created_at
       FROM orders
       WHERE user_id = $1 OR (guest_email = $2 AND user_id IS NULL)
       ORDER BY created_at DESC`,
      [user.id, user.email]
    );

    const orders = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      guestEmail: row.guest_email,
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
    const { items, subtotal, shipping, tax, total, shippingAddress } = body;

    if (!items || !shippingAddress || subtotal === undefined || total === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    let guestEmail: string | null = null;

    const { data } = await insforge.auth.getCurrentUser();
    const sessionUser = data?.user ?? null;

    if (sessionUser) {
      userId = sessionUser.id;
    } else {
      guestEmail = shippingAddress.email || null;
    }

    const orderNumber = generateOrderNumber();

    const result = await pool.query(
      `INSERT INTO orders (user_id, guest_email, order_number, items, subtotal, shipping, tax, total, shipping_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'confirmed')
       RETURNING id, order_number, created_at`,
      [
        userId,
        guestEmail,
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
