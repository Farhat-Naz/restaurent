import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { CartClearer } from "./cart-clearer";
import { OrderTracker } from "./order-tracker";

export const metadata: Metadata = { title: "Track Order" };
export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { orderNumber } = await params;
  const { new: isNew } = await searchParams;

  const order = await db.order.findUnique({
    where: { orderNumber: orderNumber.toUpperCase() },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {isNew && <CartClearer />}
      {isNew && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-green-500/40 bg-green-500/5 p-5">
          <CheckCircle2 className="size-8 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold">Thank you, {order.customerName.split(" ")[0]}! Your order is in.</p>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation to {order.customerEmail}. Keep this page open to follow your order live.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Order <span className="font-mono">{order.orderNumber}</span>
          </h1>
          <p className="text-sm text-muted-foreground">Placed {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {order.fulfillment === "DELIVERY" ? "🚚 Delivery" : "🏪 Pickup"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_18rem]">
        <OrderTracker
          orderNumber={order.orderNumber}
          initialStatus={order.status}
          fulfillment={order.fulfillment}
        />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {item.quantity} × {item.name}
                    {item.size && ` (${item.size})`}
                  </span>
                  <span>{formatCurrency(item.lineTotal)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount{order.couponCode && ` (${order.couponCode})`}</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              {order.tip > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tip</span>
                  <span>{formatCurrency(order.tip)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                Payment:{" "}
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod === "PAY_AT_RESTAURANT"
                    ? "Pay at Restaurant"
                    : "Card"}{" "}
                · {order.paymentStatus === "PAID" ? "Paid" : "Due"}
              </p>
            </CardContent>
          </Card>

          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delivering To</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {order.address}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Questions about your order? Use the chat bubble in the corner, or{" "}
        <Link href="/#contact" className="text-primary hover:underline">
          contact us
        </Link>
        .
      </p>
    </div>
  );
}
