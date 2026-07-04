/**
 * Tests for categories API endpoint
 *
 * Validates that GET /api/categories correctly fetches categories from the database,
 * uses the caching wrapper, and handles database errors gracefully.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPoolQuery = vi.fn();

vi.mock("@/utils/db", () => ({
  pool: {
    query: (...args: unknown[]) => mockPoolQuery(...args),
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: any) => fn,
  revalidateTag: vi.fn(),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Categories API /api/categories", () => {
  beforeEach(() => {
    vi.resetModules();
    mockPoolQuery.mockReset();
  });

  it("successfully returns the list of categories from the database", async () => {
    const mockCategoriesList = [
      { slug: "outerwear", name: "Outerwear", image: "/img/outerwear.webp", description: "Outerwear description" },
      { slug: "knitwear", name: "Knitwear", image: "/img/knitwear.webp", description: "Knitwear description" },
      { slug: "trousers", name: "Trousers", image: "/img/trousers.webp", description: "Trousers description" },
    ];

    mockPoolQuery.mockResolvedValue({
      rows: mockCategoriesList,
    });

    const { GET } = await import("@/app/api/categories/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockCategoriesList);
    expect(mockPoolQuery).toHaveBeenCalledTimes(1);
    expect(mockPoolQuery.mock.calls[0][0]).toContain("FROM categories");
  });

  it("returns a 500 error when database query fails", async () => {
    mockPoolQuery.mockRejectedValue(new Error("Database connection failed"));

    const { GET } = await import("@/app/api/categories/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch categories");
  });
});
