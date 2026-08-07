import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPoolQuery = vi.fn();

vi.mock("@/utils/db", () => ({
  pool: { query: (...args: unknown[]) => mockPoolQuery(...args) },
}));

describe("rateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    mockPoolQuery.mockReset();
  });

  it("allows a request within the limit", async () => {
    mockPoolQuery.mockResolvedValue({ rows: [{ request_count: 3 }] });

    const { rateLimit } = await import("@/utils/rateLimit");
    const allowed = await rateLimit("1.2.3.4", "/api/checkout/session", 5);

    expect(allowed).toBe(true);
  });

  it("denies a request that exceeds the limit", async () => {
    mockPoolQuery.mockResolvedValue({ rows: [{ request_count: 6 }] });

    const { rateLimit } = await import("@/utils/rateLimit");
    const allowed = await rateLimit("1.2.3.4", "/api/checkout/session", 5);

    expect(allowed).toBe(false);
  });

  it("allows exactly at the limit boundary", async () => {
    mockPoolQuery.mockResolvedValue({ rows: [{ request_count: 5 }] });

    const { rateLimit } = await import("@/utils/rateLimit");
    const allowed = await rateLimit("1.2.3.4", "/api/checkout/session", 5);

    expect(allowed).toBe(true);
  });

  it("upserts a per-ip, per-route minute-window counter", async () => {
    mockPoolQuery.mockResolvedValue({ rows: [{ request_count: 1 }] });

    const { rateLimit } = await import("@/utils/rateLimit");
    await rateLimit("1.2.3.4", "/api/newsletter", 10);

    expect(mockPoolQuery).toHaveBeenCalledWith(
      expect.stringContaining("rate_limits"),
      ["1.2.3.4", "/api/newsletter"]
    );
    expect(mockPoolQuery.mock.calls[0][0]).toContain("date_trunc('minute', now())");
    expect(mockPoolQuery.mock.calls[0][0]).toContain("ON CONFLICT (ip, route, window_start)");
  });
});

describe("getClientIp", () => {
  it("prioritizes x-real-ip over spoofed x-forwarded-for header", async () => {
    const { getClientIp } = await import("@/utils/rateLimit");
    const req = new Request("http://localhost/api/test", {
      headers: {
        "x-forwarded-for": "1.1.1.1, 2.2.2.2",
        "x-real-ip": "198.51.100.1",
      },
    }) as any;

    expect(getClientIp(req)).toBe("198.51.100.1");
  });

  it("prioritizes cf-connecting-ip over spoofed x-forwarded-for header", async () => {
    const { getClientIp } = await import("@/utils/rateLimit");
    const req = new Request("http://localhost/api/test", {
      headers: {
        "x-forwarded-for": "1.1.1.1, 2.2.2.2",
        "cf-connecting-ip": "203.0.113.50",
      },
    }) as any;

    expect(getClientIp(req)).toBe("203.0.113.50");
  });

  it("extracts the first IP from x-forwarded-for header when direct headers are absent", async () => {
    const { getClientIp } = await import("@/utils/rateLimit");
    const req = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178" },
    }) as any;

    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("falls back to 127.0.0.1 if no IP headers are present", async () => {
    const { getClientIp } = await import("@/utils/rateLimit");
    const req = new Request("http://localhost/api/test") as any;

    expect(getClientIp(req)).toBe("127.0.0.1");
  });
});
