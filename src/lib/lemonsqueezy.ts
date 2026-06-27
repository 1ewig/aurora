/**
 * Aurora — src/lib/lemonsqueezy.ts
 *
 * Server-side client wrapper for Lemon Squeezy REST API v1/checkouts.
 */

const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateCheckoutPayload {
  variantId: string;        // Lemon Squeezy variant ID (e.g., variant from dashboard)
  userId: string | null;    // Better Auth user ID, or null for guests
  userEmail?: string;       // pre-fill email
  userName?: string;        // pre-fill name
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
            cart_items: JSON.stringify(payload.cartItems),
            shipping_address: JSON.stringify(payload.shippingAddress),
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
