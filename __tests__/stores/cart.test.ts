import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/stores/useCartStore";

const baseProduct = {
  id: "prod-1",
  slug: "test-product",
  name: "Test Product",
  price: 50,
  image: "/img.jpg",
  category: "Outerwear",
};

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

describe("addItem", () => {
  it("adds a new product with quantity 1", () => {
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
    expect(items[0].size).toBe("M");
  });

  it("increments quantity when same id + size exists", () => {
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("adds separate entry when same id but different size", () => {
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().addItem({ ...baseProduct, size: "L" });
    expect(useCartStore.getState().items).toHaveLength(2);
  });
});

describe("removeItem", () => {
  it("removes item matching id + size", () => {
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().addItem({ ...baseProduct, size: "L" });
    useCartStore.getState().removeItem("prod-1", "M");
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].size).toBe("L");
  });

  it("does nothing for non-matching id", () => {
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().removeItem("nonexistent", "M");
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

describe("updateQuantity", () => {
  it("sets exact quantity for matching item", () => {
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().updateQuantity("prod-1", "M", 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("accepts zero (no guard)", () => {
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().updateQuantity("prod-1", "M", 0);
    expect(useCartStore.getState().items[0].quantity).toBe(0);
  });

  it("accepts negative (no guard)", () => {
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().updateQuantity("prod-1", "M", -3);
    expect(useCartStore.getState().items[0].quantity).toBe(-3);
  });
});

describe("clearCart", () => {
  it("empties all items", () => {
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().addItem({ ...baseProduct, size: "L" });
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toEqual([]);
  });
});

describe("cart drawer isOpen", () => {
  it("starts closed", () => {
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it("openCart sets isOpen true", () => {
    useCartStore.getState().openCart();
    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it("closeCart sets isOpen false", () => {
    useCartStore.getState().openCart();
    useCartStore.getState().closeCart();
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it("toggleCart flips state", () => {
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(true);
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(false);
  });
});

describe("totalItems", () => {
  it("sums quantities across all items", () => {
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().addItem({ ...baseProduct, size: "L" });
    expect(useCartStore.getState().totalItems()).toBe(3);
  });

  it("returns 0 for empty cart", () => {
    expect(useCartStore.getState().totalItems()).toBe(0);
  });
});

describe("totalPrice", () => {
  it("sums price * quantity across all items", () => {
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().addItem({ ...baseProduct, size: "M" });
    useCartStore.getState().addItem({ ...baseProduct, size: "L" });
    expect(useCartStore.getState().totalPrice()).toBe(150);
  });
});
