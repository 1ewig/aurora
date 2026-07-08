import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockPoolQuery = vi.fn();
const mockIsAdmin = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: (...args: unknown[]) => mockGetSession(...args) } },
}));

vi.mock("@/utils/db", () => ({
  pool: { query: (...args: unknown[]) => mockPoolQuery(...args) },
}));

vi.mock("@/utils/auth", () => ({
  isAdmin: (...args: unknown[]) => mockIsAdmin(...args),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

describe("GET /api/auth/role", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetSession.mockReset();
    mockPoolQuery.mockReset();
    mockIsAdmin.mockReset();
  });

  it("returns guest role with 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/auth/role/route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.role).toBe("guest");
    expect(json.isAdmin).toBe(false);
    expect(json.authenticated).toBe(false);
  });

  it("returns user role with isAdmin=false for non-admin users", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1", email: "user@test.com" } });
    mockPoolQuery.mockResolvedValue({ rows: [{ role: "user" }] });
    mockIsAdmin.mockReturnValue(false);

    const { GET } = await import("@/app/api/auth/role/route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.role).toBe("user");
    expect(json.isAdmin).toBe(false);
  });

  it("returns admin role with isAdmin=true for admin users", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "admin-1", email: "admin@test.com" } });
    mockPoolQuery.mockResolvedValue({ rows: [{ role: "admin" }] });
    mockIsAdmin.mockReturnValue(true);

    const { GET } = await import("@/app/api/auth/role/route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.role).toBe("admin");
    expect(json.isAdmin).toBe(true);
  });

  it("calls isAdmin with email and role", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1", email: "admin@test.com" } });
    mockPoolQuery.mockResolvedValue({ rows: [{ role: "admin" }] });

    const { GET } = await import("@/app/api/auth/role/route");
    await GET();

    expect(mockIsAdmin).toHaveBeenCalledWith("admin@test.com", "admin");
  });

  it("returns 500 on database error", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPoolQuery.mockRejectedValue(new Error("DB down"));

    const { GET } = await import("@/app/api/auth/role/route");
    const res = await GET();

    expect(res.status).toBe(500);
  });
});
