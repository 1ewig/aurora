/**
 * Aurora — src/lib/email-templates.ts
 *
 * Order confirmation email templates — HTML and plain-text variants.
 * Used by the order-processing flow to notify customers of successful purchases.
 */

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; size: string; quantity: number; price: string }>;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zipCode: string;
  };
}

/** Builds a styled HTML email for order confirmation. */
export function orderConfirmationHtml(data: OrderConfirmationData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#333">
          ${item.name} — <span style="color:#888;font-size:12px">Size: ${item.size} × Qty: ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#333;text-align:right;font-family:monospace">
          ${item.price}
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden">
    <tr>
      <td style="padding:32px 32px 0;text-align:center">
        <h1 style="font-size:28px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;color:#111">Order Received</h1>
        <p style="color:#666;font-size:14px;margin:0">Thank you for your purchase.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 32px">
        <p style="font-size:14px;color:#333;margin:0 0 16px">Hi <strong>${data.customerName}</strong>,</p>
        <p style="font-size:14px;color:#333;margin:0 0 16px">Your order <strong style="font-family:monospace">${data.orderNumber}</strong> has been confirmed and is being prepared.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:8px;padding:16px;margin-bottom:20px">
          <tr><td style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px">Shipping To</td></tr>
          <tr><td style="font-size:14px;color:#333">${data.shippingAddress.firstName} ${data.shippingAddress.lastName}</td></tr>
          <tr><td style="font-size:14px;color:#333">${data.shippingAddress.address}</td></tr>
          <tr><td style="font-size:14px;color:#333">${data.shippingAddress.city} ${data.shippingAddress.zipCode}</td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
          <tr>
            <th style="text-align:left;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px">Item</th>
            <th style="text-align:right;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px">Total</th>
          </tr>
          ${itemsHtml}
        </table>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#666;padding:4px 0">Subtotal</td>
            <td style="font-size:13px;color:#666;padding:4px 0;text-align:right;font-family:monospace">${data.subtotal}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#666;padding:4px 0">Shipping</td>
            <td style="font-size:13px;color:#666;padding:4px 0;text-align:right;font-family:monospace">${data.shipping}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#666;padding:4px 0">Tax</td>
            <td style="font-size:13px;color:#666;padding:4px 0;text-align:right;font-family:monospace">${data.tax}</td>
          </tr>
          <tr>
            <td style="font-size:15px;font-weight:700;color:#111;padding:8px 0;border-top:2px dashed #ddd">Total Charged</td>
            <td style="font-size:15px;font-weight:700;color:#111;padding:8px 0;border-top:2px dashed #ddd;text-align:right;font-family:monospace">${data.total}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 32px;text-align:center">
        <p style="font-size:12px;color:#999;margin:0">Aurora — Curated Wardrobe Essentials</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Builds a plain-text email for order confirmation (fallback / non-HTML clients). */
export function orderConfirmationText(data: OrderConfirmationData): string {
  const itemsList = data.items
    .map((item) => `  ${item.name} (Size: ${item.size} × ${item.quantity}) — ${item.price}`)
    .join("\n");

  return [
    `Order Confirmed — ${data.orderNumber}`,
    "",
    `Hi ${data.customerName},`,
    `Your order ${data.orderNumber} has been confirmed.`,
    "",
    "Shipping To:",
    `  ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}`,
    `  ${data.shippingAddress.address}`,
    `  ${data.shippingAddress.city} ${data.shippingAddress.zipCode}`,
    "",
    "Items:",
    itemsList,
    "",
    `Subtotal: ${data.subtotal}`,
    `Shipping: ${data.shipping}`,
    `Tax: ${data.tax}`,
    `Total: ${data.total}`,
    "",
    "— Aurora",
  ].join("\n");
}
