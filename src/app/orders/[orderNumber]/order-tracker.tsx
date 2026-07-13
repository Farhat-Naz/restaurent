"use client";

import { Check, ChefHat, CircleDot, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { STATUS_LABELS, statusFlowFor } from "@/lib/order-status";
import { cn } from "@/lib/utils";

const stepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  RECEIVED: CircleDot,
  CONFIRMED: Check,
  PREPARING: ChefHat,
  READY: Package,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: Check,
};

export function OrderTracker({
  orderNumber,
  initialStatus,
  fulfillment,
}: {
  orderNumber: string;
  initialStatus: string;
  fulfillment: string;
}) {
  const [status, setStatus] = useState(initialStatus);

  // Live tracking: poll for status changes while order is in flight
  useEffect(() => {
    if (status === "DELIVERED" || status === "CANCELLED") return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [orderNumber, status]);

  const flow = statusFlowFor(fulfillment);
  const currentIndex = flow.indexOf(status);

  if (status === "CANCELLED") {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center">
        <p className="font-semibold text-destructive">This order was cancelled.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          If you have questions, chat with us or call the restaurant.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-6">
      <ol className="space-y-0">
        {flow.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const Icon = stepIcons[step] ?? CircleDot;
          const isPickupComplete = step === "DELIVERED" && fulfillment === "PICKUP";
          return (
            <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
              {i < flow.length - 1 && (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5",
                    done ? "bg-primary" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  "z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-background text-primary animate-pulse",
                  !done && !active && "border-border bg-background text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </span>
              <div className="pt-1">
                <p className={cn("font-medium leading-none", !done && !active && "text-muted-foreground")}>
                  {isPickupComplete ? "Picked Up" : STATUS_LABELS[step]}
                </p>
                {active && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {statusHint(step, fulfillment)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function statusHint(status: string, fulfillment: string): string {
  switch (status) {
    case "RECEIVED":
      return "We've got your order and are confirming it now.";
    case "CONFIRMED":
      return "Confirmed! The kitchen is queuing it up.";
    case "PREPARING":
      return "Our chefs are cooking your food fresh.";
    case "READY":
      return fulfillment === "PICKUP"
        ? "Your order is ready — come grab it while it's hot!"
        : "Packed and ready — assigning a driver.";
    case "OUT_FOR_DELIVERY":
      return "Your driver is on the way. Hang tight!";
    case "DELIVERED":
      return "Enjoy your meal! 🎉";
    default:
      return "";
  }
}
