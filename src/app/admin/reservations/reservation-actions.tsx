"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateReservationStatus } from "../actions";

const nextActions: Record<string, { label: string; status: string; variant?: "outline" | "destructive" }[]> = {
  PENDING: [
    { label: "Confirm", status: "CONFIRMED" },
    { label: "Decline", status: "CANCELLED", variant: "destructive" },
  ],
  CONFIRMED: [
    { label: "Seat guests", status: "SEATED" },
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
  ],
  SEATED: [{ label: "Complete", status: "COMPLETED" }],
  CANCELLED: [],
  COMPLETED: [],
};

export function ReservationActions({
  reservationId,
  status,
}: {
  reservationId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const actions = nextActions[status] ?? [];
  if (actions.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="flex gap-2">
      {actions.map((a) => (
        <Button
          key={a.status}
          size="sm"
          variant={a.variant ?? "outline"}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await updateReservationStatus(reservationId, a.status);
              if (result.ok) toast.success("Reservation updated");
              else toast.error(result.error ?? "Update failed");
            })
          }
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}
