"use client";

import { useRouter } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrackPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [checking, setChecking] = useState(false);

  async function track(e: React.FormEvent) {
    e.preventDefault();
    const num = orderNumber.trim().toUpperCase();
    if (!num) return;
    setChecking(true);
    const res = await fetch(`/api/orders/${encodeURIComponent(num)}`);
    setChecking(false);
    if (res.ok) {
      router.push(`/orders/${num}`);
    } else {
      toast.error("We couldn't find that order. Double-check the number (e.g. GF-ABC123).");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <PackageSearch className="mb-4 size-14 text-primary" />
      <h1 className="text-3xl font-bold tracking-tight">Track your order</h1>
      <p className="mt-2 text-muted-foreground">
        Enter the order number from your confirmation — it looks like{" "}
        <span className="font-mono">GF-ABC123</span>.
      </p>
      <form onSubmit={track} className="mt-8 w-full space-y-3">
        <Label htmlFor="order-number" className="sr-only">
          Order number
        </Label>
        <Input
          id="order-number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="GF-ABC123"
          className="text-center font-mono uppercase"
        />
        <Button type="submit" size="lg" className="w-full" disabled={checking || !orderNumber.trim()}>
          {checking ? "Looking up…" : "Track Order"}
        </Button>
      </form>
      <p className="mt-4 text-xs text-muted-foreground">
        Try the demo order: <span className="font-mono">GF-DEMO01</span>
      </p>
    </div>
  );
}
