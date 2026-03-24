import type { BookingStatus } from "@/lib/types";

const STATUS_STYLES: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-500", label: "Cancelled" },
  declined: { bg: "bg-red-100", text: "text-red-700", label: "Declined" },
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
