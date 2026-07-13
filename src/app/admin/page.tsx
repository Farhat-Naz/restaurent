import Link from "next/link";
import { Banknote, CalendarDays, ShoppingCart, Star, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const [
    revenueAll,
    revenueToday,
    revenueWeek,
    orderCount,
    activeOrders,
    reservationsPending,
    reviewAgg,
    recentOrders,
    topSellers,
  ] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfDay } },
    }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfWeek } },
    }),
    db.order.count(),
    db.order.count({
      where: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
    }),
    db.reservation.count({ where: { status: "PENDING" } }),
    db.review.aggregate({ _avg: { rating: true }, _count: true }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.orderItem.groupBy({
      by: ["name"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const stats = [
    {
      label: "Revenue (all time)",
      value: formatCurrency(revenueAll._sum.total ?? 0),
      icon: Banknote,
    },
    {
      label: "Revenue (7 days)",
      value: formatCurrency(revenueWeek._sum.total ?? 0),
      sub: `${formatCurrency(revenueToday._sum.total ?? 0)} today`,
      icon: TrendingUp,
    },
    {
      label: "Orders",
      value: String(orderCount),
      sub: `${activeOrders} active now`,
      icon: ShoppingCart,
    },
    {
      label: "Pending reservations",
      value: String(reservationsPending),
      icon: CalendarDays,
    },
    {
      label: "Avg rating",
      value: reviewAgg._avg.rating ? reviewAgg._avg.rating.toFixed(1) : "—",
      sub: `${reviewAgg._count} reviews`,
      icon: Star,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wide">{s.label}</span>
                <s.icon className="size-4" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="size-4 text-primary" /> Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            )}
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href="/admin/orders"
                className="flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors hover:bg-accent"
              >
                <div>
                  <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.customerName} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={o.status === "DELIVERED" ? "secondary" : "default"}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </Badge>
                  <span className="text-sm font-semibold">{formatCurrency(o.total)}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-primary" /> Best Sellers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topSellers.length === 0 && (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            )}
            {topSellers.map((t, i) => (
              <div key={t.name} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  {t.name}
                </span>
                <span className="text-muted-foreground">
                  {t._sum.quantity} sold · {formatCurrency(t._sum.lineTotal ?? 0)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
