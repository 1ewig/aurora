interface OrderStatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-300",
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold border uppercase ${
        statusStyles[status] || "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}
