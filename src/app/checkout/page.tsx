"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, ShoppingBag, Store, TicketPercent } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/format";
import { round2, TAX_RATE } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const tipOptions = [0, 2, 3, 5];

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"PAY_AT_RESTAURANT" | "CARD">("PAY_AT_RESTAURANT");
  const [cardEnabled, setCardEnabled] = useState(false);
  useEffect(() => {
    fetch("/api/payments/config")
      .then((r) => r.json())
      .then((d) => setCardEnabled(Boolean(d.cardEnabled)))
      .catch(() => setCardEnabled(false));
  }, []);
  const [notes, setNotes] = useState("");
  const [tip, setTip] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [applying, setApplying] = useState(false);
  const [placing, setPlacing] = useState(false);

  const subtotal = cartSubtotal(lines);
  const discount = coupon?.discount ?? 0;
  const tax = round2(Math.max(0, subtotal - discount) * TAX_RATE);
  const total = round2(subtotal - discount + tax + tip);

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setApplying(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCoupon(null);
        toast.error(data.error ?? "Invalid coupon");
      } else {
        setCoupon(data);
        toast.success(`Coupon ${data.code} applied — you save ${formatCurrency(data.discount)}`);
      }
    } catch {
      toast.error("Could not validate coupon");
    } finally {
      setApplying(false);
    }
  }

  async function placeOrder() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in your name, email and phone");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          fulfillment: "PICKUP",
          paymentMethod,
          notes,
          tip,
          couponCode: coupon?.code,
          lines: lines.map((l) => ({
            itemId: l.itemId,
            size: l.size,
            addons: l.addons,
            quantity: l.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not place order");
        setPlacing(false);
        return;
      }
      if (data.checkoutUrl) {
        // Stripe Checkout — cart is cleared on the order page after payment
        window.location.href = data.checkoutUrl;
        return;
      }
      clear();
      toast.success("Order placed!");
      router.push(`/orders/${data.orderNumber}?new=1`);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setPlacing(false);
    }
  }

  if (!mounted) return null;

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingBag className="size-14 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">Add some dishes before checking out.</p>
        <Button render={<Link href="/menu" />}>Browse the menu</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </CardContent>
          </Card>

          {/* Pickup info */}
          <Card>
            <CardHeader>
              <CardTitle>Pickup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary/5 p-4">
                <Store className="size-6 shrink-0 text-primary" />
                <span>
                  <span className="block font-medium">Pickup at The Golden Fork</span>
                  <span className="text-xs text-muted-foreground">
                    128 Ember Lane, Springfield · usually ready in ~20 min
                  </span>
                </span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Order notes (optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. no onions, ring the bell"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("PAY_AT_RESTAURANT")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                  paymentMethod === "PAY_AT_RESTAURANT" ? "border-primary bg-primary/5" : "hover:bg-accent"
                )}
              >
                <Store className="size-6 text-primary" />
                <span>
                  <span className="block font-medium">Pay at Pickup</span>
                  <span className="text-xs text-muted-foreground">Card or cash at the counter</span>
                </span>
              </button>
              <button
                type="button"
                disabled={!cardEnabled}
                onClick={() => setPaymentMethod("CARD")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                  paymentMethod === "CARD" ? "border-primary bg-primary/5" : "hover:bg-accent",
                  !cardEnabled && "cursor-not-allowed opacity-50"
                )}
              >
                <CreditCard className="size-6 text-primary" />
                <span>
                  <span className="block font-medium">Pay Online (Card)</span>
                  <span className="text-xs text-muted-foreground">
                    {cardEnabled
                      ? "Secure checkout via Stripe — Visa, Mastercard, Amex"
                      : "Not configured yet — set STRIPE_SECRET_KEY to enable"}
                  </span>
                </span>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="h-fit lg:sticky lg:top-20">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                {lines.map((l) => (
                  <div key={l.key} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">
                      {l.quantity} × {l.name}
                      {l.size && ` (${l.size})`}
                    </span>
                    <span>{formatCurrency(l.unitPrice * l.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator />

              {/* Coupon */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <TicketPercent className="size-4" /> Coupon code
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="WELCOME10"
                    className="uppercase"
                  />
                  <Button variant="secondary" onClick={applyCoupon} disabled={applying}>
                    {applying ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Tip */}
              <div className="space-y-2">
                <Label>Tip your team</Label>
                <div className="flex gap-2">
                  {tipOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTip(t)}
                      className={cn(
                        "flex-1 rounded-lg border px-2 py-1.5 text-sm transition-colors",
                        tip === t ? "border-primary bg-primary/10 font-medium text-primary" : "hover:bg-accent"
                      )}
                    >
                      {t === 0 ? "None" : formatCurrency(t)}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount ({coupon?.code})</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                {tip > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tip</span>
                    <span>{formatCurrency(tip)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={placeOrder} disabled={placing}>
                {placing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Placing order…
                  </>
                ) : (
                  <>Place Order — {formatCurrency(total)}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
