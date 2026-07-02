/**
 * Aurora — src/app/api/checkout/session/route.ts
 *
 * API Route to verify sessions and initiate Lemon Squeezy checkout links.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckout } from "@/lib/lemonsqueezy";
import { headers } from "next/headers";
import { pool } from "@/utils/db";
import crypto from "node:crypto";

function sanitize(s: string): string {
  return s.trim().replace(/<[^>]*>/g, "").slice(0, 200);
}

export interface CheckoutSessionRequest {
  variantId: string;
  cartItems: Array<{
    internalProductId: string; // varchar(50)
    quantity: number;
    size: string;
  }>;
  shippingAddress: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zipCode: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutSessionRequest = await req.json();

    if (!body.variantId || !body.cartItems?.length || !body.shippingAddress) {
      return NextResponse.json(
        { error: "variantId, cartItems, and shippingAddress parameters are required." },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // 1. Fetch products from database to get authentic prices (prevent customer price tampering)
    const itemIds = body.cartItems.map((item) => item.internalProductId);
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

    // 2. Calculate subtotal & generate description list, and perform database-level soft reservation
    let subtotal = 0;
    const itemsDescriptionParts: string[] = [];

    // Sort to prevent deadlocks when locking rows
    const sortedCartItems = [...body.cartItems].sort((a, b) => {
      if (a.internalProductId !== b.internalProductId) {
        return a.internalProductId.localeCompare(b.internalProductId);
      }
      return (a.size || "").localeCompare(b.size || "");
    });

    const client = await pool.connect();
    const reservationId = crypto.randomUUID();
    let isReserved = false;

    try {
      await client.query("BEGIN");

      for (const item of sortedCartItems) {
        const dbProd = productMap.get(item.internalProductId);
        if (!dbProd) {
          throw new Error(`Product not found: ${item.internalProductId}`);
        }

        // Lock size row FOR UPDATE
        const sizeRes = await client.query(
          "SELECT id, stock FROM product_sizes WHERE product_id = $1 AND size = $2 FOR UPDATE",
          [item.internalProductId, item.size || ""]
        );
        const sizeInfo = sizeRes.rows[0];
        if (!sizeInfo) {
          throw new Error(`Size "${item.size}" not found for product "${dbProd.name}".`);
        }

        // Get count of active reservations (older than NOW() are ignored)
        const activeResQuery = await client.query(
          `SELECT COALESCE(SUM(quantity), 0) AS reserved
           FROM product_reservations
           WHERE product_id = $1 AND size = $2 AND expires_at > NOW()`,
          [item.internalProductId, item.size || ""]
        );
        const reservedCount = parseInt(activeResQuery.rows[0].reserved, 10);
        const availableStock = sizeInfo.stock - reservedCount;

        if (availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${dbProd.name}" (Size: ${item.size}). Only ${availableStock} available.`
          );
        }

        // Insert reservation
        await client.query(
          `INSERT INTO product_reservations (reservation_id, product_id, size, quantity, expires_at)
           VALUES ($1, $2, $3, $4, NOW() + INTERVAL '35 minutes')`,
          [reservationId, item.internalProductId, item.size || "", item.quantity]
        );

        subtotal += dbProd.price * item.quantity;
        itemsDescriptionParts.push(`${item.quantity}x ${dbProd.name} (${item.size})`);
      }

      await client.query("COMMIT");
      isReserved = true;
    } catch (err: any) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: err.message || "Inventory verification failed." },
        { status: 400 }
      );
    } finally {
      client.release();
    }

    // 3. Compute shipping, tax, total and cents
    const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + shipping + tax;
    const totalCents = Math.round(total * 100);

    const address = body.shippingAddress;

    if (!address.email?.trim() || !address.firstName?.trim() || !address.lastName?.trim() ||
        !address.address?.trim() || !address.city?.trim() || !address.zipCode?.trim()) {
      // Clean up reservation since request was invalid
      if (isReserved) {
        await pool.query(
          "DELETE FROM product_reservations WHERE reservation_id = $1",
          [reservationId]
        ).catch((delErr) => {
          console.error("Failed to clean up reservation after validation failure:", delErr);
        });
      }
      return NextResponse.json(
        { error: "All shipping address fields are required." },
        { status: 400 }
      );
    }

    const sanitizedAddress = {
      email: address.email.trim(),
      firstName: sanitize(address.firstName),
      lastName: sanitize(address.lastName),
      address: sanitize(address.address),
      city: sanitize(address.city),
      zipCode: address.zipCode.trim(),
    };

    const description = itemsDescriptionParts.join(", ");

    let checkoutData;
    try {
      checkoutData = await createCheckout({
        variantId: body.variantId,
        userId: session?.user?.id ?? null,
        userEmail: sanitizedAddress.email,
        userName: session?.user?.name,
        reservationId,
        cartItems: body.cartItems,
        shippingAddress: sanitizedAddress,
        totalPriceCents: totalCents,
        description,
      });
    } catch (err: any) {
      console.error("[POST /api/checkout/session] Lemon Squeezy call failed:", err);
      // Clean up reservation since checkout creation failed
      if (isReserved) {
        await pool.query(
          "DELETE FROM product_reservations WHERE reservation_id = $1",
          [reservationId]
        ).catch((delErr) => {
          console.error("Failed to clean up reservation after checkout failure:", delErr);
        });
      }
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
    console.error("[POST /api/checkout/session] Error creating session:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
