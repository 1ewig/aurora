/**
 * Tests for landing API endpoint
 *
 * Validates that GET /api/landing correctly aggregates data from the database,
 * maps camelCase properties, and handles database errors gracefully.
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
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  revalidateTag: vi.fn(),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Landing API /api/landing", () => {
  beforeEach(() => {
    vi.resetModules();
    mockPoolQuery.mockReset();
  });

  it("successfully returns the aggregated landing data from the database", async () => {
    const mockProducts = [
      { id: "prod-1", slug: "prod-1", name: "Product 1", category: "Outerwear", price: "120.00", badge: "New", image: "img.webp", alt_text: "Alt 1", span: null, aspect_ratio: null, description: "Desc 1" }
    ];
    const mockCategories = [
      { slug: "outerwear", name: "Outerwear", image: "/img/outerwear.webp", description: "Outerwear description" }
    ];
    const mockLookbook = [
      { id: 1, slide_number: 1, original_image: "orig.webp", image_url: "url.webp", alt_text: "Alt", tag: "tag", title: "title", link: "link" }
    ];
    const mockEditorial = [
      { id: "designer", original_image: "designer_orig.webp", image_url: "designer_url.webp", alt_text: "Designer Alt", title: "Designer Title", description: "Designer Desc" }
    ];
    const mockMaterials = [
      { id: "mat-1", name: "Cashmere", source: "Mongolia", image_url: "cashmere.webp", description: "Soft cashmere", properties: ["soft", "warm"] }
    ];

    // Mock the 5 parallel queries in order
    mockPoolQuery
      .mockResolvedValueOnce({ rows: mockProducts })
      .mockResolvedValueOnce({ rows: mockCategories })
      .mockResolvedValueOnce({ rows: mockLookbook })
      .mockResolvedValueOnce({ rows: mockEditorial })
      .mockResolvedValueOnce({ rows: mockMaterials });

    const { GET } = await import("@/app/api/landing/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products).toHaveLength(1);
    expect(data.products[0].price).toBe(120); // Number conversion check
    expect(data.categories).toHaveLength(1);
    expect(data.lookbook[0].slideNumber).toBe(1); // camelCase conversion check
    expect(data.editorial[0].originalImage).toBe("designer_orig.webp");
    expect(data.materials[0].image).toBe("cashmere.webp"); // image_url mapping check
    expect(mockPoolQuery).toHaveBeenCalledTimes(5);
  });

  it("returns a 500 error when database query fails", async () => {
    mockPoolQuery.mockRejectedValue(new Error("Database connection failed"));

    const { GET } = await import("@/app/api/landing/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch landing data.");
  });
});
