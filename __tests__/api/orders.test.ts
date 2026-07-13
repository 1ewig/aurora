import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPoolQuery = vi.fn();
const mockGetSession = vi.fn();

vi.mock("@/utils/db", () => ({
  pool: { query: (...args: unknown[]) => mockPoolQuery(...args) },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: (...args: unknown[]) => mockGetSession(...args) } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

function makeRequest(url: string): Request {
  return new Request(url);
}

describe("GET /api/orders", () => {
  beforeEach(() => {
    vi.resetModules();
    mockPoolQuery.mockReset();
    mockGetSession.mockReset();
  });

  it("returns 401 when no session", async () => {
    mockGetSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/orders/route");
    const res = await GET(makeRequest("http://localhost:3000/api/orders"));

    expect(res.status).toBe(401);
  });

  it("returns empty orders list for authenticated user with no orders", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPoolQuery
      .mockResolvedValueOnce({ rows: [{ count: "0" }] })
      .mockResolvedValueOnce({ rows: [] });

    const { GET } = await import("@/app/api/orders/route");
    const res = await GET(makeRequest("http://localhost:3000/api/orders"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.orders).toEqual([]);
    expect(json.total).toBe(0);
  });

  it("returns paginated orders for authenticated user", async () => {
    const mockOrders = [
      { id: "1", user_id: "user-1", order_number: "AUR-001", items: [], subtotal: 100, shipping: 25, tax: 8, total: 133, shipping_address: {}, status: "pending", is_paid: true, created_at: "2026-01-01" },
    ];
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPoolQuery
      .mockResolvedValueOnce({ rows: [{ count: "1" }] })
      .mockResolvedValueOnce({ rows: mockOrders });

    const { GET } = await import("@/app/api/orders/route");
    const res = await GET(makeRequest("http://localhost:3000/api/orders"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.orders).toHaveLength(1);
    expect(json.orders[0].orderNumber).toBe("AUR-001");
    expect(json.orders[0].total).toBe(133);
  });

  it("caps limit at 100", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPoolQuery
      .mockResolvedValueOnce({ rows: [{ count: "0" }] })
      .mockResolvedValueOnce({ rows: [] });

    const { GET } = await import("@/app/api/orders/route");
    const res = await GET(makeRequest("http://localhost:3000/api/orders?limit=999"));

    expect(res.status).toBe(200);
    const queryArgs = mockPoolQuery.mock.calls[1];
    expect(queryArgs[1][1]).toBe(100);
  });

  describe("lsOrderId lookup", () => {
    it("returns order number when found", async () => {
      mockPoolQuery.mockResolvedValue({ rows: [{ order_number: "AUR-001" }], rowCount: 1 });

      const { GET } = await import("@/app/api/orders/route");
      const res = await GET(makeRequest("http://localhost:3000/api/orders?lsOrderId=ls-1"));
      const json = await res.json();
    expect(res.status).toBe(200);
      expect(json.orderNumber).toBe("AUR-001");
    });

    it("returns 404 when lsOrderId not found", async () => {
      mockPoolQuery.mockResolvedValue({ rows: [], rowCount: 0 });

      const { GET } = await import("@/app/api/orders/route");
      const res = await GET(makeRequest("http://localhost:3000/api/orders?lsOrderId=ls-missing"));

      expect(res.status).toBe(404);
    });
  });

  it("returns 500 on database error", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPoolQuery.mockRejectedValue(new Error("DB down"));

    const { GET } = await import("@/app/api/orders/route");
    const res = await GET(makeRequest("http://localhost:3000/api/orders"));

    expect(res.status).toBe(500);
  });
});
