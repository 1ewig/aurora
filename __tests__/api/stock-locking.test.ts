/**
 * Tests for stock locking and reservation behavior
 *
 * Validates that checkout sessions insert reservations, reject insufficient
 * stock, and that webhook processing deducts stock inside transactions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockQuery = vi.fn();
const mockConnect = vi.fn();
const mockClientQuery = vi.fn();
const mockClientRelease = vi.fn();

const mockPool = {
  query: (...args: unknown[]) => mockQuery(...args),
  connect: () =>
    mockConnect().then(() => ({
      query: mockClientQuery,
      release: mockClientRelease,
    })),
};

vi.mock("@/utils/db", () => ({
  pool: mockPool,
  withTransaction: async (fn: (client: any) => Promise<any>) => {
    const client = await mockPool.connect();
    await client.query("BEGIN");
    try {
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
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

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Stock locking and reservation", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    mockQuery.mockReset().mockResolvedValue({ rows: [{ request_count: 1 }] });
    mockConnect.mockReset().mockResolvedValue(undefined);
    mockClientQuery.mockReset();
    mockClientRelease.mockReset();
    mockCreateCheckout.mockReset();

    process.env.NEXT_PUBLIC_LS_ORDER_VARIANT_ID = "test-variant-123";

    const mod = await import("@/app/api/checkout/session/route");
    POST = mod.POST as unknown as (req: Request) => Promise<Response>;
  });

  // ── Reservation insertion ──────────────────────────────────────────────

  it("inserts a product reservation row inside the transaction", async () => {
    // Mock the product lookup (pool.query for SELECT products)
    mockQuery
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValue({
        rows: [{ id: "prod-1", price: 100, name: "Test Product" }],
      });

    // Mock transaction sequence
    mockClientQuery
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: "size-1", stock: 20 }] }) // SELECT product_sizes FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ reserved: "0" }] }) // SELECT active reservations
      .mockResolvedValueOnce(undefined) // INSERT INTO product_reservations
      .mockResolvedValueOnce(undefined); // COMMIT

    mockCreateCheckout.mockResolvedValue({
      checkoutUrl: "https://checkout.test",
      checkoutId: "chk-1",
    });

    const res = await POST(
      makeRequest({
        cartItems: [{ internalProductId: "prod-1", quantity: 2, size: "M" }],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(200);

    // Verify INSERT INTO product_reservations was called (4th client query)
    const insertCall = mockClientQuery.mock.calls[3];
    expect(insertCall[0]).toContain("product_reservations");
    expect(insertCall[1]).toContain("prod-1"); // product_id
    expect(insertCall[1]).toContain("M"); // size
    expect(insertCall[1]).toContain(2); // quantity
  });

  // ── Insufficient stock ─────────────────────────────────────────────────

  it("rejects checkout with a message to reduce quantity when available stock is non-zero but insufficient", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValue({
        rows: [{ id: "prod-1", price: 100, name: "Test Product" }],
      });

    mockClientQuery
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: "size-1", stock: 5 }] }) // SELECT product_sizes → 5 in stock
      .mockResolvedValueOnce({ rows: [{ reserved: "4" }] }); // 4 already reserved → only 1 available

    // Request 3, but only 1 available (5 stock - 4 reserved)
    const res = await POST(
      makeRequest({
        cartItems: [{ internalProductId: "prod-1", quantity: 3, size: "M" }],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Insufficient stock");
    expect(json.error).toContain("Please reduce your quantity and try again");

    // Verify ROLLBACK was called
    const rollbackCall = mockClientQuery.mock.calls.find(
      (call) => typeof call[0] === "string" && call[0] === "ROLLBACK"
    );
    expect(rollbackCall).toBeDefined();
  });

  it("rejects checkout with a regular insufficient stock message when available stock is 0", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValue({
        rows: [{ id: "prod-1", price: 100, name: "Test Product" }],
      });

    mockClientQuery
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: "size-1", stock: 5 }] }) // SELECT product_sizes → 5 in stock
      .mockResolvedValueOnce({ rows: [{ reserved: "5" }] }); // 5 already reserved → 0 available

    const res = await POST(
      makeRequest({
        cartItems: [{ internalProductId: "prod-1", quantity: 1, size: "M" }],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Insufficient stock");
    expect(json.error).not.toContain("Please reduce your quantity");

    // Verify ROLLBACK was called
    const rollbackCall = mockClientQuery.mock.calls.find(
      (call) => typeof call[0] === "string" && call[0] === "ROLLBACK"
    );
    expect(rollbackCall).toBeDefined();
  });

  // ── FOR UPDATE locking ─────────────────────────────────────────────────

  it("uses FOR UPDATE to lock size rows during reservation", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValue({
        rows: [{ id: "prod-1", price: 50, name: "Locked Product" }],
      });

    mockClientQuery
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: "size-1", stock: 10 }] }) // SELECT FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ reserved: "0" }] }) // reservations
      .mockResolvedValueOnce(undefined) // INSERT reservation
      .mockResolvedValueOnce(undefined); // COMMIT

    mockCreateCheckout.mockResolvedValue({
      checkoutUrl: "https://checkout.test",
      checkoutId: "chk-1",
    });

    await POST(
      makeRequest({
        cartItems: [{ internalProductId: "prod-1", quantity: 1, size: "S" }],
        shippingAddress: validAddress,
      })
    );

    // Verify the SELECT query uses FOR UPDATE
    const selectCall = mockClientQuery.mock.calls[1];
    expect(selectCall[0]).toContain("FOR UPDATE");
  });

  // ── Client release on error ────────────────────────────────────────────

  it("releases client connection back to pool even on error", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValue({
        rows: [{ id: "prod-1", price: 100, name: "Error Product" }],
      });

    mockClientQuery
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(new Error("DB error")); // SELECT fails

    const res = await POST(
      makeRequest({
        cartItems: [{ internalProductId: "prod-1", quantity: 1, size: "L" }],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(400);
    // Verify client.release() was called in finally block
    expect(mockClientRelease).toHaveBeenCalled();
  });

  it("accumulates errors for multiple items that fail stock checks", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValue({
        rows: [
          { id: "prod-1", price: 100, name: "Product One" },
          { id: "prod-2", price: 150, name: "Product Two" },
        ],
      });

    mockClientQuery
      .mockResolvedValueOnce(undefined) // BEGIN
      // First product checks:
      .mockResolvedValueOnce({ rows: [{ id: "size-1", stock: 5 }] }) // SELECT product_sizes for prod-1
      .mockResolvedValueOnce({ rows: [{ reserved: "4" }] }) // reservations for prod-1 -> 1 available
      // Second product checks:
      .mockResolvedValueOnce({ rows: [{ id: "size-2", stock: 10 }] }) // SELECT product_sizes for prod-2
      .mockResolvedValueOnce({ rows: [{ reserved: "10" }] }); // reservations for prod-2 -> 0 available

    const res = await POST(
      makeRequest({
        cartItems: [
          { internalProductId: "prod-1", quantity: 3, size: "M" },
          { internalProductId: "prod-2", quantity: 2, size: "L" },
        ],
        shippingAddress: validAddress,
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    
    expect(json.error).toContain("Insufficient stock for \"Product One\" (Size: M). Please reduce your quantity and try again.");
    expect(json.error).toContain("Insufficient stock for \"Product Two\" (Size: L).");
    expect(json.error.split("\n")).toHaveLength(2);

    // Verify ROLLBACK was called
    const rollbackCall = mockClientQuery.mock.calls.find(
      (call) => typeof call[0] === "string" && call[0] === "ROLLBACK"
    );
    expect(rollbackCall).toBeDefined();
  });
});
