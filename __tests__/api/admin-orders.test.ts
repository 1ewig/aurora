import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDbMocks } from "../utils/mocks";

const db = createDbMocks();
const mockRequireAdmin = vi.fn();

vi.mock("@/utils/db", () => ({
  pool: db.mockPool,
}));

vi.mock("@/utils/admin", () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

function req(body?: unknown): Request {
  return new Request("http://localhost:3000/api/admin/orders/ord-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.resetModules();
  db.reset();
  mockRequireAdmin.mockReset();
  mockRequireAdmin.mockResolvedValue({ user: { id: "admin-1" }, error: undefined });
});

describe("PATCH /api/admin/orders/[id]", () => {
  it("rejects invalid status", async () => {
    const { PATCH } = await import("@/app/api/admin/orders/[id]/route");
    const res = await PATCH(req({ status: "invalid-status" }), { params: Promise.resolve({ id: "ord-1" }) });

    expect(res.status).toBe(400);
  });

  it("rejects missing status", async () => {
    const { PATCH } = await import("@/app/api/admin/orders/[id]/route");
    const res = await PATCH(req({}), { params: Promise.resolve({ id: "ord-1" }) });

    expect(res.status).toBe(400);
  });

  it("accepts all valid statuses", async () => {
    db.mockQuery.mockResolvedValue({ rows: [{ id: "ord-1", status: "confirmed" }] });

    const { PATCH } = await import("@/app/api/admin/orders/[id]/route");

    for (const status of ["pending", "confirmed", "shipped", "delivered", "cancelled"]) {
      db.mockQuery.mockResolvedValue({ rows: [{ id: "ord-1", status }] });
      const res = await PATCH(req({ status }), { params: Promise.resolve({ id: "ord-1" }) });
      expect(res.status).toBe(200);
    }
  });

  it("returns 404 when order not found", async () => {
    db.mockQuery.mockResolvedValue({ rows: [] });

    const { PATCH } = await import("@/app/api/admin/orders/[id]/route");
    const res = await PATCH(req({ status: "confirmed" }), { params: Promise.resolve({ id: "ord-missing" }) });

    expect(res.status).toBe(404);
  });

  it("returns the updated order", async () => {
    db.mockQuery.mockResolvedValue({ rows: [{ id: "ord-1", status: "shipped" }] });

    const { PATCH } = await import("@/app/api/admin/orders/[id]/route");
    const res = await PATCH(req({ status: "shipped" }), { params: Promise.resolve({ id: "ord-1" }) });
    const json = await res.json();

    expect(json.success).toBe(true);
  });
});
