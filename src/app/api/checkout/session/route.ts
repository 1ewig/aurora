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

    // 2. Calculate subtotal & generate description list
    let subtotal = 0;
    const itemsDescriptionParts: string[] = [];
    for (const item of body.cartItems) {
      const dbProd = productMap.get(item.internalProductId);
      if (!dbProd) {
        return NextResponse.json(
          { error: `Product not found: ${item.internalProductId}` },
          { status: 400 }
        );
      }

      // Validate stock availability
      const sizeRes = await pool.query(
        "SELECT stock FROM product_sizes WHERE product_id = $1 AND size = $2",
        [item.internalProductId, item.size || ""]
      );
      const sizeInfo = sizeRes.rows[0];
      if (!sizeInfo) {
        return NextResponse.json(
          { error: `Size "${item.size}" not found for product "${dbProd.name}".` },
          { status: 400 }
        );
      }
      if (sizeInfo.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${dbProd.name}" (Size: ${item.size}). Only ${sizeInfo.stock} available.` },
          { status: 400 }
        );
      }

      subtotal += dbProd.price * item.quantity;
      itemsDescriptionParts.push(`${item.quantity}x ${dbProd.name} (${item.size})`);
    }

    // 3. Compute shipping, tax, total and cents
    const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + shipping + tax;
    const totalCents = Math.round(total * 100);

    const address = body.shippingAddress;

    if (!address.email?.trim() || !address.firstName?.trim() || !address.lastName?.trim() ||
        !address.address?.trim() || !address.city?.trim() || !address.zipCode?.trim()) {
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

    const checkoutData = await createCheckout({
      variantId: body.variantId,
      userId: session?.user?.id ?? null,
      userEmail: sanitizedAddress.email,
      userName: session?.user?.name,
      cartItems: body.cartItems,
      shippingAddress: sanitizedAddress,
      totalPriceCents: totalCents,
      description,
    });

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
