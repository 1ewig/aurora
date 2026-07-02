/**
 * Tests for POST /api/checkout/session
 *
 * Validates input sanitization, quantity enforcement, duplicate merging,
 * server-side variant ID derivation, and shipping address requirements.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockQuery = vi.fn();
const mockConnect = vi.fn();
const mockClientQuery = vi.fn();
const mockClientRelease = vi.fn();

vi.mock("@/utils/db", () => ({
  pool: {
    query: (...args: unknown[]) => mockQuery(...args),
    connect: () =>
      mockConnect().then(() => ({
        query: mockClientQuery,
        release: mockClientRelease,
      })),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: "user-1", name: "Test User" },
      }),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

const mockCreateCheckout = vi.fn();
vi.mock("@/lib/lemonsqueezy", () => ({
  createCheckout: (...args: unknown[]) => mockCreateCheckout(...args),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost:3000/api/checkout/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validAddress = {
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  address: "123 Main St",
  city: "Springfield",
  zipCode: "62701",
};

const validCartItem = {
  internalProductId: "prod-1",
  quantity: 2,
  size: "M",
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("POST /api/checkout/session", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    mockQuery.mockReset();
    mockConnect.mockReset().mockResolvedValue(undefined);
    mockClientQuery.mockReset();
    mockClientRelease.mockReset();
    mockCreateCheckout.mockReset();

    // Set the env var before importing the route
    process.env.NEXT_PUBLIC_LS_ORDER_VARIANT_ID = "test-variant-123";

    const mod = await import(
      "@/app/api/checkout/session/route"
    );
    POST = mod.POST as unknown as (req: Request) => Promise<Response>;
  });

  // ── Missing variant env var ──────────────────────────────────────────────

  it("returns 500 when NEXT_PUBLIC_LS_ORDER_VARIANT_ID is missing", async () => {
    delete process.env.NEXT_PUBLIC_LS_ORDER_VARIANT_ID;

    // Re-import to pick up the missing env var during handler execution
    vi.resetModules();
    const mod = await import("@/app/api/checkout/session/route");
    const handler = mod.POST as unknown as (req: Request) => Promise<Response>;

    const res = await handler(
      makeRequest({
        cartItems: [validCartItem],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain("configuration");
  });

  // ── Missing required fields ──────────────────────────────────────────────

  it("returns 400 when cartItems is missing", async () => {
    const res = await POST(
      makeRequest({ shippingAddress: validAddress })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("required");
  });

  it("returns 400 when shippingAddress is missing", async () => {
    const res = await POST(
      makeRequest({ cartItems: [validCartItem] })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("required");
  });

  // ── Quantity validation ──────────────────────────────────────────────────

  it("rejects non-integer quantity (float)", async () => {
    const res = await POST(
      makeRequest({
        cartItems: [{ ...validCartItem, quantity: 1.5 }],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("quantity");
  });

  it("rejects zero quantity", async () => {
    const res = await POST(
      makeRequest({
        cartItems: [{ ...validCartItem, quantity: 0 }],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(400);
  });

  it("rejects negative quantity", async () => {
    const res = await POST(
      makeRequest({
        cartItems: [{ ...validCartItem, quantity: -3 }],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(400);
  });

  it("rejects quantity exceeding max limit of 10", async () => {
    const res = await POST(
      makeRequest({
        cartItems: [{ ...validCartItem, quantity: 11 }],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("limit");
  });

  // ── Duplicate cart item merging ──────────────────────────────────────────

  it("rejects merged duplicate items that exceed quantity limit", async () => {
    const res = await POST(
      makeRequest({
        cartItems: [
          { internalProductId: "prod-1", quantity: 7, size: "M" },
          { internalProductId: "prod-1", quantity: 5, size: "M" },
        ],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("limit");
  });

  // ── Server-side variant ID ───────────────────────────────────────────────

  it("ignores client-provided variantId and uses server env", async () => {
    // Set up mocks for a complete successful flow
    mockQuery.mockResolvedValue({
      rows: [{ id: "prod-1", price: 100, name: "Test Product" }],
    });
    mockClientQuery
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: "size-1", stock: 50 }] }) // SELECT product_sizes FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ reserved: "0" }] }) // SELECT reservations
      .mockResolvedValueOnce(undefined) // INSERT reservation
      .mockResolvedValueOnce(undefined); // COMMIT

    mockCreateCheckout.mockResolvedValue({
      checkoutUrl: "https://checkout.test",
      checkoutId: "chk-1",
    });

    const res = await POST(
      makeRequest({
        variantId: "attacker-variant-999",
        cartItems: [validCartItem],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(200);
    // Verify createCheckout was called with server env variant, not client's
    expect(mockCreateCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        variantId: "test-variant-123",
      })
    );
  });

  // ── Missing product ID in cart item ──────────────────────────────────────

  it("rejects cart item with missing internalProductId", async () => {
    const res = await POST(
      makeRequest({
        cartItems: [{ quantity: 2, size: "M" }],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(400);
  });
});
