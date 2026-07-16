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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!await rateLimit(ip, 'checkout', 10)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body: CheckoutSessionRequest = await req.json();

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

    // 1. Input parameter validation
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

    // 2. Merge duplicate cart items (same product + size)
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

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // 3. Fetch products from database to get authentic prices (prevent customer price tampering)
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

    // 4. Calculate subtotal & generate description list, and perform database-level soft reservation
    let subtotal = 0;
    const itemsDescriptionParts: string[] = [];

    // Sort to prevent deadlocks when locking rows
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

          const sizeRes = await client.query(
            "SELECT id, stock FROM product_sizes WHERE product_id = $1 AND size = $2 FOR UPDATE",
            [item.internalProductId, item.size || ""]
          );
          const sizeInfo = sizeRes.rows[0];
          if (!sizeInfo) {
            errors.push(`Size "${item.size}" not found for product "${dbProd.name}".`);
            continue;
          }

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

    // 5. Compute shipping, tax, total and cents
    const { total } = calculateOrderPricing(subtotal);
    const totalCents = Math.round(total * 100);

    // 6. Validate and sanitize shipping address
    const address = body.shippingAddress;
    const addressError = validateShippingAddress(address);
    if (addressError) {
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
