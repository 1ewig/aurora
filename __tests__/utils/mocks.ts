import { vi } from "vitest";

export function createDbMocks() {
  const mockQuery = vi.fn();
  const mockConnect = vi.fn();
  const mockClientQuery = vi.fn();
  const mockClientRelease = vi.fn();

  const mockPool = {
    query: (...args: unknown[]) => mockQuery(...args),
    connect: () =>
      mockConnect().then(() => ({
        query: (sql: string, values?: any[]) => {
          if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") {
            return Promise.resolve({ rows: [] });
          }
          return mockClientQuery(sql, values);
        },
        release: mockClientRelease,
      })),
  };

  const mockWithTransaction = async (fn: (client: any) => Promise<any>) => {
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
  };

  function reset() {
    mockQuery.mockReset();
    mockConnect.mockReset().mockResolvedValue(undefined);
    mockClientQuery.mockReset();
    mockClientRelease.mockReset();
  }

  return { mockQuery, mockConnect, mockClientQuery, mockClientRelease, mockPool, mockWithTransaction, reset };
}

export function createAuthMock(session?: { user: { id: string; name: string } } | null) {
  const resolved = session !== undefined ? session : { user: { id: "user-1", name: "Test User" } };
  const mockGetSession = vi.fn().mockResolvedValue(resolved);
  return { mockGetSession, reset: () => mockGetSession.mockReset() };
}

export function makeRequest(url: string, options?: { method?: string; body?: unknown }): Request {
  const { method = "GET", body } = options ?? {};
  return new Request(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}
