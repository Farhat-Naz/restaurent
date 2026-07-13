"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUSES, STATUS_LABELS, statusFlowFor } from "@/lib/order-status";
import { updateOrderStatus } from "../actions";

export function OrderStatusSelect({
  orderId,
  status,
  fulfillment,
}: {
  orderId: string;
  status: string;
  fulfillment: string;
}) {
  const [pending, startTransition] = useTransition();
  const options = [...statusFlowFor(fulfillment), "CANCELLED"];
  // Keep an unexpected current status visible in the list
  if (!options.includes(status)) options.unshift(status);

  return (
    <Select
      value={status}
      onValueChange={(value) => {
        if (!value || value === status) return;
        startTransition(async () => {
          const result = await updateOrderStatus(orderId, value);
          if (result.ok) {
            toast.success(`Order moved to ${STATUS_LABELS[value] ?? value}`);
          } else {
            toast.error(result.error ?? "Update failed");
          }
        });
      }}
      disabled={pending}
    >
      <SelectTrigger className="w-44" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((s) => (
          <SelectItem key={s} value={s}>
            {s === "DELIVERED" && fulfillment === "PICKUP"
              ? "Picked Up"
              : (STATUS_LABELS[s] ?? s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { ORDER_STATUSES };
