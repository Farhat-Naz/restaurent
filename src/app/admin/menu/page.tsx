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
import { formatCurrency } from "@/lib/format";
import {
  AddItemDialog,
  AvailabilityToggle,
  DeleteItemButton,
  FeaturedToggle,
} from "./menu-controls";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const [items, categories] = await Promise.all([
    db.menuItem.findMany({
      include: { category: true, _count: { select: { orderItems: true } } },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Menu Items ({items.length})</h2>
        <AddItemDialog categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">★</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <FeaturedToggle itemId={item.id} isFeatured={item.isFeatured} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.image ?? "🍽️"}</span>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="max-w-64 truncate text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category.name}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.price)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {item._count.orderItems}
                </TableCell>
                <TableCell>
                  <AvailabilityToggle itemId={item.id} isAvailable={item.isAvailable} />
                </TableCell>
                <TableCell>
                  <DeleteItemButton itemId={item.id} name={item.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
