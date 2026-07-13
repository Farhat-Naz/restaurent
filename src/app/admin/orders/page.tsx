import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { OrderStatusSelect } from "./status-select";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Orders ({orders.length})</h2>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No orders yet — they&apos;ll appear here as customers check out.
                </TableCell>
              </TableRow>
            )}
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <p className="font-mono font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{o.customerName}</p>
                  <p className="text-xs text-muted-foreground">{o.customerPhone}</p>
                </TableCell>
                <TableCell className="max-w-56">
                  <p className="truncate text-sm text-muted-foreground">
                    {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                  </p>
                  {o.notes && (
                    <p className="truncate text-xs italic text-muted-foreground">“{o.notes}”</p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {o.fulfillment === "DELIVERY" ? "Delivery" : "Pickup"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm">
                    {o.paymentMethod === "COD"
                      ? "COD"
                      : o.paymentMethod === "PAY_AT_RESTAURANT"
                        ? "At restaurant"
                        : o.paymentMethod}
                  </p>
                  <Badge variant={o.paymentStatus === "PAID" ? "secondary" : "outline"} className="mt-0.5">
                    {o.paymentStatus === "PAID" ? "Paid" : "Due"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(o.total)}
                </TableCell>
                <TableCell>
                  <OrderStatusSelect
                    orderId={o.id}
                    status={o.status}
                    fulfillment={o.fulfillment}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
