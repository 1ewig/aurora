import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockQuery = vi.fn();

vi.mock("@/utils/db", () => ({
  pool: {
    query: (...args: unknown[]) => mockQuery(...args),
  },
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("POST /api/newsletter", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    mockQuery.mockReset();

    // Default mock behavior for rateLimit checks (always allow)
    mockQuery.mockResolvedValue({ rows: [{ request_count: 1 }] });

    const mod = await import("@/app/api/newsletter/route");
    POST = mod.POST as unknown as (req: Request) => Promise<Response>;
  });

  function makeRequest(body: Record<string, unknown>): Request {
    return new Request("http://localhost:3000/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 400 when email field is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("A valid email address is required");
  });

  it("returns 400 when email format is invalid (e.g. test@)", async () => {
    const res = await POST(makeRequest({ email: "test@" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("A valid email address is required");
  });

  it("returns 400 when email is invalid (e.g. @@@)", async () => {
    const res = await POST(makeRequest({ email: "@@@" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("A valid email address is required");
  });

  it("returns 200 and inserts sanitized email into DB when email format is valid", async () => {
    // 1st query: rate limit check, returns count=1
    // 2nd query: insert into DB, returns void
    mockQuery
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] }) // rate limiter
      .mockResolvedValueOnce({ rows: [] }); // insert into newsletter_subscriptions

    const res = await POST(makeRequest({ email: "  TEST@example.com  " }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    // Verify SQL insert normalized the email
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery.mock.calls[1][0]).toContain("INSERT INTO public.newsletter_subscriptions");
    expect(mockQuery.mock.calls[1][1][0]).toBe("test@example.com");
  });

  it("returns 400 with a unique constraint error message if already subscribed", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] }) // rate limiter
      .mockRejectedValueOnce({ code: "23505" }); // unique constraint code

    const res = await POST(makeRequest({ email: "test@example.com" }));

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("already subscribed");
  });
});
