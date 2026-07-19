/**
 * Aurora — src/app/api/checkout/session/route.ts
 *
 * POST /api/checkout/session — initiates a Lemon Squeezy checkout session.
 *
 * The critical flow:
 *  1. Rate-limit by IP (10/min).
 *  2. Validate input, merge duplicate cart items (same product + size).
 *  3. Fetch authentic prices from DB (prevents client-side price tampering).
 *  4. Open a DB transaction: lock product_sizes rows FOR UPDATE (sorted by
 *     product ID to prevent deadlocks), check active reservations, compute
 *     available stock, and insert 35-minute soft reservations.
 *  5. Compute pricing (free shipping >$500, 8% tax).
 *  6. Sanitize shipping address, call LS createCheckout API.
 *  7. On LS failure: roll back reservations (DELETE by reservation_id).
 *  8. Return checkout URL for the overlay modal.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckout } from "@/lib/lemonsqueezy";
import { headers } from "next/headers";
import { pool, withTransaction } from "@/utils/db";
import { calculateOrderPricing } from "@/utils/pricing";
import {
  sanitizeShippingAddress,
  validateShippingAddress,
  type ShippingAddress,
} from "@/utils/sanitize";
import { rateLimit } from "@/utils/rateLimit";
import { rethrowIfDynamicServerError } from "@/utils/errors";
import crypto from "node:crypto";

export interface CheckoutSessionRequest {
  variantId?: string;
  cartItems: Array<{
    internalProductId: string;
    quantity: number;
    size: string;
  }>;
  shippingAddress: ShippingAddress;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 checkout attempts per minute per IP
    const ip = (req as any).ip || req.headers.get('x-real-ip') || '127.0.0.1';
    if (!await rateLimit(ip, 'checkout', 10)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body: CheckoutSessionRequest = await req.json();

    // Validate that the LS product variant ID is configured on the server
    const variantId = process.env.NEXT_PUBLIC_LS_ORDER_VARIANT_ID;
    if (!variantId) {
      console.error("[Checkout Session] NEXT_PUBLIC_LS_ORDER_VARIANT_ID is not configured in environment.");
      return NextResponse.json(
        { error: "Store checkout configuration is incomplete on the server." },
        { status: 500 }
      );
    }

    if (!body.cartItems?.length || !body.shippingAddress) {
      return NextResponse.json(
        { error: "cartItems and shippingAddress parameters are required." },
        { status: 400 }
      );
    }

    // 1. Validate each cart item's structure and enforce a max quantity of 10
    for (const item of body.cartItems) {
      if (
        !item.internalProductId ||
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return NextResponse.json(
          { error: "Invalid item quantity parameter." },
          { status: 400 }
        );
      }
      if (item.quantity > 10) {
        return NextResponse.json(
          { error: "Maximum purchase limit exceeded (10 items per product size)." },
          { status: 400 }
        );
      }
    }

    // 2. Merge duplicate items: same product ID + size = combined quantity
    const mergedCart = new Map<string, { internalProductId: string; quantity: number; size: string }>();
    for (const item of body.cartItems) {
      const key = `${item.internalProductId}-${(item.size || "").trim()}`;
      const existing = mergedCart.get(key);
      if (existing) {
        existing.quantity += item.quantity;
        if (existing.quantity > 10) {
          return NextResponse.json(
            { error: "Maximum purchase limit exceeded (10 items per product size)." },
            { status: 400 }
          );
        }
      } else {
        mergedCart.set(key, {
          internalProductId: item.internalProductId,
          quantity: item.quantity,
          size: (item.size || "").trim()
        });
      }
    }
    const cartItems = Array.from(mergedCart.values());

    // Fetch the session for optional user association (guest checkout is the default)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // 3. Fetch authentic prices from the database (prevents price tampering attacks)
    const itemIds = cartItems.map((item) => item.internalProductId);
    const result = await pool.query(
      "SELECT id, price, name FROM products WHERE id = ANY($1)",
      [itemIds]
    );
    const dbProducts = result.rows;

    const productMap = new Map<string, { price: number; name: string }>();
    for (const row of dbProducts) {
      productMap.set(row.id, {
        price: Number(row.price),
        name: row.name,
      });
    }

    // 4. Calculate subtotal, build description, and create stock reservations
    let subtotal = 0;
    const itemsDescriptionParts: string[] = [];

    /*
     * Sort cart items by product ID then size before locking rows.
     * This ensures a consistent lock order across concurrent requests,
     * preventing PostgreSQL deadlocks that would occur if two requests
     * lock rows in different sequences.
     */
    const sortedCartItems = [...cartItems].sort((a, b) => {
      if (a.internalProductId !== b.internalProductId) {
        return a.internalProductId.localeCompare(b.internalProductId);
      }
      return (a.size || "").localeCompare(b.size || "");
    });

    const reservationId = crypto.randomUUID();

    try {
      await withTransaction(async (client) => {
        const errors: string[] = [];
        for (const item of sortedCartItems) {
          const dbProd = productMap.get(item.internalProductId);
          if (!dbProd) {
            errors.push(`Product not found: ${item.internalProductId}`);
            continue;
          }

          // Lock the specific product_size row to prevent concurrent stock changes
          const sizeRes = await client.query(
            "SELECT id, stock FROM product_sizes WHERE product_id = $1 AND size = $2 FOR UPDATE",
            [item.internalProductId, item.size || ""]
          );
          const sizeInfo = sizeRes.rows[0];
          if (!sizeInfo) {
            errors.push(`Size "${item.size}" not found for product "${dbProd.name}".`);
            continue;
          }

          // Count existing active (non-expired) reservations for this product+size
          const activeResQuery = await client.query(
            `SELECT COALESCE(SUM(quantity), 0) AS reserved
              FROM product_reservations
              WHERE product_id = $1 AND size = $2 AND expires_at > NOW()`,
            [item.internalProductId, item.size || ""]
          );
          const reservedCount = parseInt(activeResQuery.rows[0].reserved, 10);
          const availableStock = sizeInfo.stock - reservedCount;

          if (availableStock < item.quantity) {
            if (availableStock > 0) {
              errors.push(
                `Insufficient stock for "${dbProd.name}" (Size: ${item.size}). Please reduce your quantity and try again.`
              );
            } else {
              errors.push(
                `Insufficient stock for "${dbProd.name}" (Size: ${item.size}).`
              );
            }
            continue;
          }

          // Insert a 35-minute soft reservation — this is consumed or expires
          await client.query(
            `INSERT INTO product_reservations (reservation_id, product_id, size, quantity, expires_at)
              VALUES ($1, $2, $3, $4, NOW() + INTERVAL '35 minutes')`,
            [reservationId, item.internalProductId, item.size || "", item.quantity]
          );

          subtotal += dbProd.price * item.quantity;
          itemsDescriptionParts.push(`${item.quantity}x ${dbProd.name} (${item.size})`);
        }

        if (errors.length > 0) {
          throw new Error(errors.join("\n"));
        }
      });
    } catch (err: any) {
      rethrowIfDynamicServerError(err);
      return NextResponse.json(
        { error: err.message || "Inventory verification failed." },
        { status: 400 }
      );
    }

    // 5. Compute pricing: free shipping over $500, 8% tax
    const { total } = calculateOrderPricing(subtotal);
    const totalCents = Math.round(total * 100);

    // 6. Validate and sanitize shipping address (strip HTML tags, enforce lengths)
    const address = body.shippingAddress;
    const addressError = validateShippingAddress(address);
    if (addressError) {
      // Roll back reservations if address validation fails
      await pool.query(
        "DELETE FROM product_reservations WHERE reservation_id = $1",
        [reservationId]
      ).catch((delErr) => {
        console.error("Failed to clean up reservation after validation failure:", delErr);
      });
      return NextResponse.json(
        { error: addressError },
        { status: 400 }
      );
    }

    const sanitizedAddress = sanitizeShippingAddress(address);
    const description = itemsDescriptionParts.join(", ");

    // 7. Call Lemon Squeezy API to create the checkout session
    let checkoutData;
    try {
      checkoutData = await createCheckout({
        variantId,
        userId: session?.user?.id ?? null,
        userEmail: sanitizedAddress.email,
        userName: session?.user?.name,
        reservationId,
        cartItems,
        shippingAddress: sanitizedAddress,
        totalPriceCents: totalCents,
        description,
      });
    } catch (err: any) {
      rethrowIfDynamicServerError(err);
      console.error("[POST /api/checkout/session] Lemon Squeezy call failed:", err);
      // Roll back all reservations on LS API failure
      await pool.query(
        "DELETE FROM product_reservations WHERE reservation_id = $1",
        [reservationId]
      ).catch((delErr) => {
        console.error("Failed to clean up reservation after checkout failure:", delErr);
      });
      return NextResponse.json(
        { error: "Failed to initialize secure checkout with payment provider." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: checkoutData.checkoutUrl,
      checkoutId: checkoutData.checkoutId,
    });
  } catch (err: any) {
    rethrowIfDynamicServerError(err);
    console.error("[POST /api/checkout/session] Error creating session:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
