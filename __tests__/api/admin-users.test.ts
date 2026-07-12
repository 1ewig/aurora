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

function req(url: string, options?: { method?: string; body?: unknown }): Request {
  const { method = "GET", body } = options ?? {};
  return new Request(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.resetModules();
  db.reset();
  mockRequireAdmin.mockReset();
  mockRequireAdmin.mockResolvedValue({ user: { id: "admin-1", name: "Admin" }, error: undefined });
});

describe("GET /api/admin/users/[id]", () => {
  it("returns user details", async () => {
    db.mockQuery.mockResolvedValue({ rows: [{ id: "u1", name: "User", email: "u@test.com", emailVerified: true, image: null, role: "user", createdAt: "2026-01-01", updatedAt: "2026-01-01" }] });

    const { GET } = await import("@/app/api/admin/users/[id]/route");
    const res = await GET(req("http://localhost:3000"), { params: Promise.resolve({ id: "u1" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBe("u1");
  });

  it("returns 404 when user not found", async () => {
    db.mockQuery.mockResolvedValue({ rows: [] });

    const { GET } = await import("@/app/api/admin/users/[id]/route");
    const res = await GET(req("http://localhost:3000"), { params: Promise.resolve({ id: "u-missing" }) });

    expect(res.status).toBe(404);
  });

  it("returns sessions when include=sessions", async () => {
    db.mockQuery.mockResolvedValue({ rows: [{ id: "s1", userId: "u1", expiresAt: "2027-01-01", createdAt: "2026-01-01", ipAddress: null, userAgent: null }] });

    const { GET } = await import("@/app/api/admin/users/[id]/route");
    const res = await GET(req("http://localhost:3000?include=sessions"), { params: Promise.resolve({ id: "u1" }) });
    const json = await res.json();

    expect(json.sessions).toHaveLength(1);
    expect(json.sessions[0].id).toBe("s1");
  });
});

describe("PATCH /api/admin/users/[id]", () => {
  it("rejects invalid role", async () => {
    const { PATCH } = await import("@/app/api/admin/users/[id]/route");
    const res = await PATCH(req("http://localhost:3000", { method: "PATCH", body: { role: "superadmin" } }), { params: Promise.resolve({ id: "u1" }) });

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Invalid role");
  });

  it("rejects empty update body", async () => {
    const { PATCH } = await import("@/app/api/admin/users/[id]/route");
    const res = await PATCH(req("http://localhost:3000", { method: "PATCH", body: {} }), { params: Promise.resolve({ id: "u1" }) });

    expect(res.status).toBe(400);
  });

  it("updates name and role", async () => {
    db.mockQuery.mockResolvedValue({ rows: [{ id: "u1", name: "New Name", email: "u@test.com", emailVerified: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" }] });

    const { PATCH } = await import("@/app/api/admin/users/[id]/route");
    const res = await PATCH(req("http://localhost:3000", { method: "PATCH", body: { name: "New Name", role: "admin" } }), { params: Promise.resolve({ id: "u1" }) });

    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe("New Name");
  });

  it("coerces emailVerified to boolean", async () => {
    db.mockQuery.mockResolvedValue({ rows: [{ id: "u1", emailVerified: true }] });

    const { PATCH } = await import("@/app/api/admin/users/[id]/route");
    await PATCH(req("http://localhost:3000", { method: "PATCH", body: { emailVerified: "true" } }), { params: Promise.resolve({ id: "u1" }) });

    const values = db.mockQuery.mock.calls[1][1] as any[];
    expect(values[0]).toBe(true);
  });

  it("returns 404 when user not found", async () => {
    db.mockQuery.mockResolvedValue({ rows: [] });

    const { PATCH } = await import("@/app/api/admin/users/[id]/route");
    const res = await PATCH(req("http://localhost:3000", { method: "PATCH", body: { name: "Ghost" } }), { params: Promise.resolve({ id: "u-missing" }) });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/admin/users/[id]", () => {
  it("blocks self-deletion", async () => {
    mockRequireAdmin.mockResolvedValue({ user: { id: "admin-1", name: "Admin" }, error: undefined });

    const { DELETE } = await import("@/app/api/admin/users/[id]/route");
    const res = await DELETE(new Request("http://localhost:3000"), { params: Promise.resolve({ id: "admin-1" }) });

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Cannot delete your own account");
  });

  it("returns 404 when user not found", async () => {
    db.mockQuery.mockResolvedValue({ rows: [] });

    const { DELETE } = await import("@/app/api/admin/users/[id]/route");
    const res = await DELETE(new Request("http://localhost:3000"), { params: Promise.resolve({ id: "u-missing" }) });

    expect(res.status).toBe(404);
  });

  it("deletes user successfully", async () => {
    db.mockQuery.mockResolvedValue({ rows: [{ id: "u2", email: "delete@test.com", name: "Delete Me" }] });

    const { DELETE } = await import("@/app/api/admin/users/[id]/route");
    const res = await DELETE(new Request("http://localhost:3000"), { params: Promise.resolve({ id: "u2" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.deleted.id).toBe("u2");
  });
});
