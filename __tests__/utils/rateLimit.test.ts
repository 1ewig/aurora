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
