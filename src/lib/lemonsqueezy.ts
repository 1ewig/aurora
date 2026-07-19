/**
 * Aurora — src/lib/lemonsqueezy.ts
 *
 * Server-side client wrapper for the Lemon Squeezy REST API v1.
 * Currently only exposes createCheckout() which creates a checkout
 * session with custom pricing, cart data, and shipping info.
 *
 * The API returns JSON:API format (vnd.api+json). Custom data fields
 * (cart_items, shipping_address, reservation_id) are serialized as
 * JSON strings inside the checkout_data.custom object so they survive
 * the round-trip through LS and back in the webhook.
 */

const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateCheckoutPayload {
  variantId: string;        // Lemon Squeezy variant ID (e.g., variant from dashboard)
  userId: string | null;    // Better Auth user ID, or null for guests
  userEmail?: string;       // pre-fill email
  userName?: string;        // pre-fill name
  reservationId?: string;   // optional database-side soft reservation ID
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
  totalPriceCents: number; // dynamically calculated total in cents
  description?: string;     // dynamic description of order items
}

export interface LemonSqueezyCheckoutResponse {
  checkoutUrl: string;
  checkoutId: string;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export async function createCheckout(
  payload: CreateCheckoutPayload
): Promise<LemonSqueezyCheckoutResponse> {
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

  if (!storeId) throw new Error("LEMON_SQUEEZY_STORE_ID is not set in environment.");
  if (!apiKey) throw new Error("LEMON_SQUEEZY_API_KEY is not set in environment.");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

  /*
   * Build the JSON:API payload for Lemon Squeezy v1/checkouts.
   * Key details:
   *  - custom_price: overrides the variant's default price.
   *  - embed: true enables the overlay modal (vs. redirect).
   *  - checkout_data.custom: passes-through data that comes back
   *    in the webhook as meta.custom_data.
   *  - redirect_url: uses [order_id] placeholder that LS replaces
   *    with the actual LS order ID after payment.
   *  - expires_at: checkout link expires in 30 minutes.
   */
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        custom_price: payload.totalPriceCents,
        checkout_options: {
          embed: true, // required for LemonSqueezy overlay modal
          media: true,
          logo: true,
          button_color: "#000000",
        },
        checkout_data: {
          ...(payload.userEmail?.trim() ? { email: payload.userEmail.trim() } : {}),
          ...(payload.userName?.trim() ? { name: payload.userName.trim() } : {}),
          custom: {
            user_id: payload.userId ?? "guest",
            // Serialize complex objects as JSON strings for LS storage
            cart_items: JSON.stringify(payload.cartItems),
            shipping_address: JSON.stringify(payload.shippingAddress),
            ...(payload.reservationId ? { reservation_id: payload.reservationId } : {}),
          },
        },
        product_options: {
          redirect_url: `${appUrl}/checkout/success?order_id=[order_id]`,
          receipt_thank_you_note: "Thank you for shopping at Aurora! Your order is being processed. 🎉",
          ...(payload.description ? { description: payload.description } : {}),
        },
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins
      },
      relationships: {
        store: {
          data: { type: "stores", id: storeId },
        },
        variant: {
          data: { type: "variants", id: payload.variantId },
        },
      },
    },
  };

  const res = await fetch(`${LS_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    console.error("[LemonSqueezy] API request failed:", errorJson);
    throw new Error(`Lemon Squeezy API request failed with status: ${res.status}`);
  }

  const json = await res.json();
  return {
    checkoutUrl: json.data.attributes.url as string,
    checkoutId: json.data.id as string,
  };
}
