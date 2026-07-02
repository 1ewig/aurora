/**
 * Aurora — src/app/api/webhooks/lemonsqueezy/route.ts
 *
 * Webhook route handler for Lemon Squeezy integration:
 * - Verifies the HMAC signature timing-safely.
 * - Restricts double processing via processed_webhooks.
 * - Resolves product catalog details from database to compute pricing safely.
 * - Wraps variant stock updates and order generation inside a single PG transaction.
 * - Fires transactional order confirmation emails.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { pool } from "@/utils/db";
import { sendEmail } from "@/lib/email";
import { orderConfirmationHtml, orderConfirmationText } from "@/lib/email-templates";
import { formatCurrency } from "@/utils/formatCurrency";

function sanitize(s: string): string {
  return s.trim().replace(/<[^>]*>/g, "").slice(0, 200);
}

interface VerifiedItem {
  id: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
}

// ─── HMAC Verification ────────────────────────────────────────────────────────

function verifySignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("LEMON_SQUEEZY_WEBHOOK_SECRET is not configured.");
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(signatureHeader, "utf8");

  if (digest.length !== signature.length) return false;
  return crypto.timingSafeEqual(digest, signature);
}

// ─── Post Webhook Handler ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Read raw body before parsing
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") ?? "";

    // 2. Cryptographic signature check
    if (!signature || !verifySignature(rawBody, signature)) {
      console.warn("[LS Webhook] Failed signature verification.");
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const lsEventId = payload.data?.id;

    console.log(`[LS Webhook] Received event: ${eventName} (Event ID: ${lsEventId})`);
    console.log("[LS Webhook] Meta data:", JSON.stringify(payload.meta, null, 2));

    if (!lsEventId) {
      return NextResponse.json({ error: "Missing event ID." }, { status: 400 });
    }

    // 3. Handle event inside transaction with idempotency protection
    if (eventName === "order_created") {
      await handleOrderCreated(payload, lsEventId);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("[LS Webhook] Error processing event payload:", err);
    // Always return 200 to prevent Lemon Squeezy from blocking webhooks
    return NextResponse.json({ error: "Internal processing failed." }, { status: 200 });
  }
}

// ─── Order Creation Handler ──────────────────────────────────────────────────

async function handleOrderCreated(payload: any, lsEventId: string) {
  const attrs = payload.data?.attributes;
  const customData = payload.meta?.custom_data ?? {};

  if (!attrs) throw new Error("No attributes payload inside the event.");

  const lsOrderId: string = String(payload.data.id);
  const lsOrderNumber: number = attrs.order_number;
  const lsCustomerId: string = String(attrs.customer_id);

  const userId: string | null =
    customData.user_id && customData.user_id !== "guest" ? customData.user_id : null;

  const reservationId: string | null = customData.reservation_id ?? null;

  const cartItems: Array<{
    internalProductId: string;
    quantity: number;
    size: string;
  }> = customData.cart_items ? JSON.parse(customData.cart_items) : [];

  const shippingAddress = customData.shipping_address ? JSON.parse(customData.shipping_address) : {};

  const sanitizedAddress = {
    email: (shippingAddress.email || "").trim(),
    firstName: sanitize(shippingAddress.firstName || ""),
    lastName: sanitize(shippingAddress.lastName || ""),
    address: sanitize(shippingAddress.address || ""),
    city: sanitize(shippingAddress.city || ""),
    zipCode: (shippingAddress.zipCode || "").trim(),
  };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check and insert idempotency key inside the transaction
    const checkRes = await client.query(
      `INSERT INTO processed_webhooks (ls_event_id) 
       VALUES ($1) 
       ON CONFLICT (ls_event_id) DO NOTHING 
       RETURNING 1`,
      [lsEventId]
    );

    if ((checkRes.rowCount ?? 0) === 0) {
      console.log(`[LS Webhook] Event ${lsEventId} was already processed. Skipping.`);
      await client.query("COMMIT");
      return;
    }

    const verifiedItems: VerifiedItem[] = [];
    let subtotal = 0;

    for (const item of cartItems) {
      // Get correct price and details from products
      const productRes = await client.query(
        "SELECT price, name, slug, image FROM products WHERE id = $1",
        [item.internalProductId]
      );
      const product = productRes.rows[0];
      if (!product) {
        throw new Error(`Product mapping failed for ID: ${item.internalProductId}`);
      }

      const dbPrice = Number(product.price);
      subtotal += dbPrice * item.quantity;

      verifiedItems.push({
        id: item.internalProductId,
        slug: product.slug,
        name: product.name,
        size: item.size || "",
        price: dbPrice,
        image: product.image,
        quantity: item.quantity,
      });

      // Get size record and lock for update
      const sizeRes = await client.query(
        `SELECT id, stock FROM product_sizes
         WHERE product_id = $1 AND size = $2 FOR UPDATE`,
        [item.internalProductId, item.size]
      );
      const sizeInfo = sizeRes.rows[0];
      if (!sizeInfo) {
        throw new Error(`Size "${item.size}" not found for product "${item.internalProductId}".`);
      }

      if (sizeInfo.stock < item.quantity) {
        throw new Error(`Insufficient stock for product "${item.internalProductId}" (Size: ${item.size}).`);
      }

      // Update stock in product_sizes
      await client.query(
        `UPDATE product_sizes
         SET stock = stock - $1
         WHERE id = $2`,
        [item.quantity, sizeInfo.id]
      );
    }

    // Delete reservation if exists
    if (reservationId) {
      await client.query(
        "DELETE FROM product_reservations WHERE reservation_id = $1",
        [reservationId]
      );
    }

    const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + shipping + tax;

    // Insert order record mapping payments provider parameters
    await client.query(
      `INSERT INTO orders (
         user_id, order_number, items, subtotal, shipping, tax, total,
         shipping_address, status, is_paid, payment_provider, ls_order_id, ls_order_number
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', TRUE, 'lemonsqueezy', $9, $10)
       ON CONFLICT (ls_order_id) DO NOTHING`,
      [
        userId,
        `AUR-LS-${lsOrderNumber}`,
        JSON.stringify(verifiedItems),
        subtotal,
        shipping,
        tax,
        total,
        JSON.stringify(sanitizedAddress),
        lsOrderId,
        lsOrderNumber,
      ]
    );

    // Update client customer ID if logged-in
    if (userId) {
      await client.query(
        `UPDATE better_auth."user"
         SET ls_customer_id = $1
         WHERE id = $2 AND ls_customer_id IS NULL`,
        [lsCustomerId, userId]
      );
    }

    await client.query("COMMIT");

    // Trigger transactional order confirmation email
    await sendEmail({
      to: sanitizedAddress.email,
      subject: `Order Confirmed — AUR-LS-${lsOrderNumber}`,
      text: orderConfirmationText({
        orderNumber: `AUR-LS-${lsOrderNumber}`,
        customerName: `${sanitizedAddress.firstName} ${sanitizedAddress.lastName}`.trim() || "Valued Customer",
        items: verifiedItems.map((i) => ({
          name: i.name,
          size: i.size || "",
          quantity: i.quantity,
          price: formatCurrency(i.price),
        })),
        subtotal: formatCurrency(subtotal),
        shipping: shipping === 0 ? "Complimentary" : formatCurrency(shipping),
        tax: formatCurrency(tax),
        total: formatCurrency(total),
        shippingAddress: {
          firstName: sanitizedAddress.firstName,
          lastName: sanitizedAddress.lastName,
          address: sanitizedAddress.address,
          city: sanitizedAddress.city,
          zipCode: sanitizedAddress.zipCode,
        },
      }),
      html: orderConfirmationHtml({
        orderNumber: `AUR-LS-${lsOrderNumber}`,
        customerName: `${sanitizedAddress.firstName} ${sanitizedAddress.lastName}`.trim() || "Valued Customer",
        items: verifiedItems.map((i) => ({
          name: i.name,
          size: i.size || "",
          quantity: i.quantity,
          price: formatCurrency(i.price),
        })),
        subtotal: formatCurrency(subtotal),
        shipping: shipping === 0 ? "Complimentary" : formatCurrency(shipping),
        tax: formatCurrency(tax),
        total: formatCurrency(total),
        shippingAddress: {
          firstName: sanitizedAddress.firstName,
          lastName: sanitizedAddress.lastName,
          address: sanitizedAddress.address,
          city: sanitizedAddress.city,
          zipCode: sanitizedAddress.zipCode,
        },
      }),
    }).catch((emailErr) => {
      console.error("[LS Webhook] Failed to dispatch order confirmation email:", emailErr);
    });

  } catch (err: any) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
