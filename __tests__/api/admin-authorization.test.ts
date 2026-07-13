/**
 * Tests for admin authorization guards
 *
 * Validates that requireAdmin / requireRole correctly enforce
 * authentication and role-based access control on admin API endpoints.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockGetSession = vi.fn();
const mockPoolQuery = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

vi.mock("@/utils/db", () => ({
  pool: {
    query: (...args: unknown[]) => mockPoolQuery(...args),
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Admin authorization", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetSession.mockReset();
    mockPoolQuery.mockReset();
  });

  // ── requireRole / requireAdmin unit tests ──────────────────────────────

  describe("requireAdmin utility", () => {
    it("returns 401 error when no session exists", async () => {
      mockGetSession.mockResolvedValue(null);

      const { requireAdmin } = await import("@/utils/admin");
      const result = await requireAdmin();

      expect(result.error).toBeDefined();
      expect(result.user).toBeNull();

      // Check the response status
      const res = result.error!;
      expect(res.status).toBe(401);
    });

    it("returns 403 error when user has 'user' role (insufficient level)", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "user-1", name: "Regular User" },
      });
      mockPoolQuery.mockResolvedValue({
        rows: [{ role: "user" }],
      });

      const { requireAdmin } = await import("@/utils/admin");
      const result = await requireAdmin();

      expect(result.error).toBeDefined();
      expect(result.user).toBeNull();

      const res = result.error!;
      expect(res.status).toBe(403);
    });

    it("passes through when user has 'admin' role", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "admin-1", name: "Admin User" },
      });
      mockPoolQuery.mockResolvedValue({
        rows: [{ role: "admin" }],
      });

      const { requireAdmin } = await import("@/utils/admin");
      const result = await requireAdmin();

      expect(result.error).toBeUndefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe("admin-1");
    });

    it("returns 403 for unknown role strings (defaults to level 0)", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "user-2", name: "Unknown Role" },
      });
      mockPoolQuery.mockResolvedValue({
        rows: [{ role: "moderator" }], // not in ROLE_LEVELS map
      });

      const { requireAdmin } = await import("@/utils/admin");
      const result = await requireAdmin();

      expect(result.error).toBeDefined();
      const res = result.error!;
      expect(res.status).toBe(403);
    });

    it("returns 500 error when auth system throws", async () => {
      mockGetSession.mockRejectedValue(new Error("Auth service down"));

      const { requireAdmin } = await import("@/utils/admin");
      const result = await requireAdmin();

      expect(result.error).toBeDefined();
      const res = result.error!;
      expect(res.status).toBe(500);
    });
  });

  // ── Admin products endpoint integration ────────────────────────────────

  describe("Admin products endpoint authorization", () => {
    it("returns 401 for unauthenticated GET /api/admin/products", async () => {
      mockGetSession.mockResolvedValue(null);

      const { GET } = await import("@/app/api/admin/products/route");
      const res = await GET(new Request("http://localhost:3000/api/admin/products"));

      expect(res.status).toBe(401);
    });

    it("returns 403 for non-admin GET /api/admin/products", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "user-1", name: "Regular" },
      });
      mockPoolQuery.mockResolvedValue({ rows: [{ role: "user" }] });

      const { GET } = await import("@/app/api/admin/products/route");
      const res = await GET(new Request("http://localhost:3000/api/admin/products"));

      expect(res.status).toBe(403);
    });

    it("returns 401 for unauthenticated POST /api/admin/products", async () => {
      mockGetSession.mockResolvedValue(null);

      const { POST } = await import("@/app/api/admin/products/route");
      const req = new Request("http://localhost:3000/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "test", slug: "test", name: "Test" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });
  });

  // ── requireRole with custom levels ─────────────────────────────────────

  describe("requireRole with custom levels", () => {
    it("allows user-level access when minLevel is 0", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "user-1", name: "Regular" },
      });
      mockPoolQuery.mockResolvedValue({ rows: [{ role: "user" }] });

      const { requireRole } = await import("@/utils/admin");
      const result = await requireRole(0);

      expect(result.error).toBeUndefined();
      expect(result.role).toBe("user");
    });
  });
});
