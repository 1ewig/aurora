import { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";

export function useCheckoutForm(onOrderPlaced?: (
  orderNumber: string,
  maskedEmail: string,
  cardNumber: string,
  maskedCardNumber: string,
  items: any[],
  subtotal: number,
  shipping: number,
  tax: number,
  total: number
) => void) {
  const clearCart = useCartStore((s) => s.clearCart);
  const items = useCartStore((s) => s.items);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !firstName || !lastName || !address || !city || !zipCode) {
      return;
    }

    setLoading(true);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + shipping + tax;
    const itemsSnapshot = items.map((item) => ({ ...item }));

    setTimeout(() => {
      const generatedOrder = `AUR-${new Date().getFullYear()}-${Math.floor(
        100000 + Math.random() * 900000
      )}`;
      setOrderNumber(generatedOrder);
      setSuccess(true);
      setLoading(false);
      onOrderPlaced?.(
        generatedOrder,
        maskEmail(email),
        cardNumber,
        maskCardNumber(cardNumber),
        itemsSnapshot,
        subtotal,
        shipping,
        tax,
        total
      );
      clearCart();
    }, 1500);
  };

  const maskEmail = (rawEmail: string) => {
    const [name, domain] = rawEmail.split("@");
    if (!domain) return rawEmail;
    const maskedName = name[0] + "***" + name[name.length - 1];
    return `${maskedName}@${domain}`;
  };

  const maskCardNumber = (rawCard: string) => {
    const cleaned = rawCard.replace(/\s+/g, "");
    if (cleaned.length < 4) return "****";
    return `•••• •••• •••• ${cleaned.slice(-4)}`;
  };

  return {
    email, setEmail,
    firstName, setFirstName,
    lastName, setLastName,
    address, setAddress,
    city, setCity,
    zipCode, setZipCode,
    cardNumber, setCardNumber,
    cardExpiry, setCardExpiry,
    cardCVC, setCardCVC,
    loading, orderNumber, success,
    items,
    handlePlaceOrder,
    maskEmail,
    maskCardNumber,
  };
}
