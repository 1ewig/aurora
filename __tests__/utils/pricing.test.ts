import { describe, it, expect } from "vitest";
import { calculateOrderPricing } from "@/utils/pricing";

describe("calculateOrderPricing", () => {
  it("returns zero shipping, tax, and total for zero subtotal", () => {
    const result = calculateOrderPricing(0);
    expect(result).toEqual({ shipping: 0, tax: 0, total: 0 });
  });

  it("adds $25 shipping and 8% tax for subtotal under $500", () => {
    const result = calculateOrderPricing(100);
    expect(result.shipping).toBe(25);
    expect(result.tax).toBe(8);
    expect(result.total).toBe(133);
  });

  it("charges shipping at exactly $500 boundary", () => {
    const result = calculateOrderPricing(500);
    expect(result.shipping).toBe(25);
    expect(result.tax).toBe(40);
    expect(result.total).toBe(565);
  });

  it("waives shipping over $500", () => {
    const result = calculateOrderPricing(600);
    expect(result.shipping).toBe(0);
    expect(result.tax).toBe(48);
    expect(result.total).toBe(648);
  });

  it("waives shipping just above $500 boundary", () => {
    const result = calculateOrderPricing(501);
    expect(result.shipping).toBe(0);
    expect(result.tax).toBe(40.08);
    expect(result.total).toBeCloseTo(541.08);
  });

  it("rounds tax to 2 decimal places", () => {
    const result = calculateOrderPricing(10.50);
    expect(result.tax).toBe(0.84);
    expect(result.total).toBeCloseTo(36.34);
  });

  it("handles large subtotals", () => {
    const result = calculateOrderPricing(10000);
    expect(result.shipping).toBe(0);
    expect(result.tax).toBe(800);
    expect(result.total).toBe(10800);
  });
});
