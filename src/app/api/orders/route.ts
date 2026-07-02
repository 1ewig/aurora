/**
 * Aurora — src/app/api/orders/route.ts
 *
 * Order API — GET returns the current user's orders, POST creates a new order
 * with stock validation, inventory deduction, and email confirmation.
 */

import { NextResponse } from "next/server";
import { pool } from "@/utils/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/email";
import { orderConfirmationHtml, orderConfirmationText } from "@/lib/email-templates";
import { formatCurrency } from "@/utils/formatCurrency";

interface VerifiedItem {
  id: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
}

/** Strips HTML tags and trims user-supplied strings to prevent XSS. */
function sanitize(s: string): string {
  return s.trim().replace(/<[^>]*>/g, "").slice(0, 200);
}

/** Generates a unique order number in the format AUR-YYYY-NNNNNN. */
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(100000 + Math.random() * 900000);
  return `AUR-${year}-${num}`;
}

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
      if (!item.id || typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity < 1) {
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

    const firstName = shippingAddress.firstName?.trim();
    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    if (!shippingAddress.lastName?.trim()) {
      return NextResponse.json(
        { error: "Last name is required" },
        { status: 400 }
      );
    }

    if (!shippingAddress.address?.trim()) {
      return NextResponse.json(
        { error: "Street address is required" },
        { status: 400 }
      );
    }

    if (!shippingAddress.city?.trim()) {
      return NextResponse.json(
        { error: "City is required" },
        { status: 400 }
      );
    }

    if (!shippingAddress.zipCode?.trim()) {
      return NextResponse.json(
        { error: "ZIP code is required" },
        { status: 400 }
      );
    }

    // Sanitize address fields before storage and email use
    const sanitizedAddress = {
      email: shippingAddress.email.trim(),
      firstName: sanitize(shippingAddress.firstName),
      lastName: sanitize(shippingAddress.lastName || ""),
      address: sanitize(shippingAddress.address),
      city: sanitize(shippingAddress.city),
      zipCode: shippingAddress.zipCode.trim(),
    };

    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id ?? null;

    const client = await pool.connect();
    let order;
    let verifiedItems: VerifiedItem[] = [];
    const PG_UNIQUE_VIOLATION = "23505";

    try {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        let subtotal = 0;
        verifiedItems = [];

        try {
          await client.query("BEGIN");

          for (const item of items) {
            const productRes = await client.query(
              "SELECT price, name, slug, image FROM products WHERE id = $1",
              [item.id]
            );
            const product = productRes.rows[0];
            if (!product) {
              throw new Error(`Product not found: ${item.name || item.id}`);
            }

            const dbPrice = Number(product.price);

            const sizeRes = await client.query(
              "SELECT stock FROM product_sizes WHERE product_id = $1 AND size = $2 FOR UPDATE",
              [item.id, item.size || ""]
            );
            const sizeInfo = sizeRes.rows[0];
            if (!sizeInfo) {
              throw new Error(`Size "${item.size}" not found for product "${product.name}".`);
            }

            if (sizeInfo.stock < item.quantity) {
              throw new Error(`Insufficient stock for "${product.name}" (Size: ${item.size}). Only ${sizeInfo.stock} available.`);
            }

            await client.query(
              "UPDATE product_sizes SET stock = stock - $1 WHERE product_id = $2 AND size = $3",
              [item.quantity, item.id, item.size || ""]
            );

            subtotal += dbPrice * item.quantity;
            verifiedItems.push({
              id: item.id,
              slug: product.slug,
              name: product.name,
              size: item.size || "",
              price: dbPrice,
              image: product.image,
              quantity: item.quantity,
            });
          }

          const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
          const tax = Math.round(subtotal * 0.08 * 100) / 100;
          const total = subtotal + shipping + tax;

          const orderNumber = generateOrderNumber();

          const result = await client.query(
            `INSERT INTO orders (user_id, order_number, items, subtotal, shipping, tax, total, shipping_address, status, is_paid)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', FALSE)
             RETURNING id, order_number, created_at, subtotal, shipping, tax, total`,
            [
              userId,
              orderNumber,
              JSON.stringify(verifiedItems),
              subtotal,
              shipping,
              tax,
              total,
              JSON.stringify(sanitizedAddress),
            ]
          );

          order = result.rows[0];
          await client.query("COMMIT");
          lastError = null;
          break;
        } catch (txErr: any) {
          await client.query("ROLLBACK");
          if (txErr?.code !== PG_UNIQUE_VIOLATION) throw txErr;
          lastError = txErr;
        }
      }

      if (lastError) throw lastError;

      // Success path continues below
    } catch (txErr: any) {
      console.error("Order transaction failed:", txErr);
      return NextResponse.json(
        { error: txErr.message || "Failed to place order." },
        { status: 400 }
      );
    } finally {
      client.release();
    }

    const orderSubtotal = Number(order.subtotal);
    const orderShipping = Number(order.shipping);
    const orderTax = Number(order.tax);
    const orderTotal = Number(order.total);

    await sendEmail({
      to: email,
      subject: `Order Confirmed — ${order.order_number}`,
      text: orderConfirmationText({
        orderNumber: order.order_number,
        customerName: `${sanitizedAddress.firstName} ${sanitizedAddress.lastName}`.trim() || "Valued Customer",
        items: verifiedItems.map((i) => ({
          name: i.name,
          size: i.size || "",
          quantity: i.quantity,
          price: formatCurrency(i.price),
        })),
        subtotal: formatCurrency(orderSubtotal),
        shipping: orderShipping === 0 ? "Complimentary" : formatCurrency(orderShipping),
        tax: formatCurrency(orderTax),
        total: formatCurrency(orderTotal),
        shippingAddress: {
          firstName: sanitizedAddress.firstName,
          lastName: sanitizedAddress.lastName,
          address: sanitizedAddress.address,
          city: sanitizedAddress.city,
          zipCode: sanitizedAddress.zipCode,
        },
      }),
      html: orderConfirmationHtml({
        orderNumber: order.order_number,
        customerName: `${sanitizedAddress.firstName} ${sanitizedAddress.lastName}`.trim() || "Valued Customer",
        items: verifiedItems.map((i) => ({
          name: i.name,
          size: i.size || "",
          quantity: i.quantity,
          price: formatCurrency(i.price),
        })),
        subtotal: formatCurrency(orderSubtotal),
        shipping: orderShipping === 0 ? "Complimentary" : formatCurrency(orderShipping),
        tax: formatCurrency(orderTax),
        total: formatCurrency(orderTotal),
        shippingAddress: {
          firstName: sanitizedAddress.firstName,
          lastName: sanitizedAddress.lastName,
          address: sanitizedAddress.address,
          city: sanitizedAddress.city,
          zipCode: sanitizedAddress.zipCode,
        },
      }),
    });

    return NextResponse.json({
      id: order.id,
      orderNumber: order.order_number,
      createdAt: order.created_at,
      subtotal: orderSubtotal,
      shipping: orderShipping,
      tax: orderTax,
      total: orderTotal,
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}
