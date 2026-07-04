import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/utils/formatCurrency";

describe("formatCurrency", () => {
  it("formats whole dollar amount without decimals", () => {
    expect(formatCurrency(100)).toBe("$100");
  });

  it("rounds up to nearest dollar", () => {
    expect(formatCurrency(100.6)).toBe("$101");
  });

  it("rounds down to nearest dollar", () => {
    expect(formatCurrency(100.4)).toBe("$100");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats large numbers with commas", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000");
  });

  it("supports different currencies", () => {
    expect(formatCurrency(100, "EUR")).toBe("€100");
  });

  it("handles small sub-dollar amounts (rounds up)", () => {
    expect(formatCurrency(0.5)).toBe("$1");
  });
});
