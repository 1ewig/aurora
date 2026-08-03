import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import jwt from "jsonwebtoken";

const mockGetSession = vi.fn();
const mockQuery = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: (...args: unknown[]) => mockGetSession(...args) } },
}));

vi.mock("@/utils/db", () => ({
  pool: { query: (...args: unknown[]) => mockQuery(...args) },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

const ORIGINAL_ENV = { ...process.env };
const SECRET = "test-secret-123";

describe("GET /api/insforge-token", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetSession.mockReset();
    mockQuery.mockReset();
    process.env.INSFORGE_JWT_SECRET = SECRET;
    process.env.ADMIN_EMAILS = "admin@example.com";
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns 401 when not signed in", async () => {
    mockGetSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/insforge-token/route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 403 when user is not an admin", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-42", email: "user@example.com" } });
    mockQuery.mockResolvedValue({ rows: [{ role: "user" }] });

    const { GET } = await import("@/app/api/insforge-token/route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toBe("Forbidden");
  });

  it("signs a 1h HS256 JWT with admin role for authorized admin users", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-42", email: "admin@example.com" } });
    mockQuery.mockResolvedValue({ rows: [{ role: "admin" }] });

    const { GET } = await import("@/app/api/insforge-token/route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");

    const decoded = jwt.verify(json.token, SECRET) as {
      sub: string;
      role: string;
      aud: string;
      exp: number;
      iat: number;
    };
    expect(decoded.sub).toBe("user-42");
    expect(decoded.role).toBe("admin");
    expect(decoded.aud).toBe("insforge-api");
    expect(decoded.exp - decoded.iat).toBe(3600);
  });

  it("throws when INSFORGE_JWT_SECRET is missing", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-42", email: "admin@example.com" } });
    mockQuery.mockResolvedValue({ rows: [{ role: "admin" }] });
    delete process.env.INSFORGE_JWT_SECRET;

    const { GET } = await import("@/app/api/insforge-token/route");

    await expect(GET()).rejects.toThrow("Missing required env var: INSFORGE_JWT_SECRET");
  });
});
