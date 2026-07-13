export const ORDER_STATUSES = [
  "RECEIVED",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Order Received",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  SEATED: "Seated",
  COMPLETED: "Completed",
};

/** Statuses that make sense for a pickup order (no delivery leg). */
export function statusFlowFor(fulfillment: string): string[] {
  return fulfillment === "PICKUP"
    ? ["RECEIVED", "CONFIRMED", "PREPARING", "READY", "DELIVERED"]
    : [...ORDER_STATUSES];
}
