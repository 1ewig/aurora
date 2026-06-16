export function calculateOrderPricing(subtotal: number) {
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  return { shipping, tax, total } as const;
}
