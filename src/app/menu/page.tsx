import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/menu-item-card";
import { db } from "@/lib/db";
import { getCategories, toCardData } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Menu" };
export const dynamic = "force-dynamic";

type SearchParams = {
  category?: string;
  q?: string;
  sort?: string;
  diet?: string;
};

const sortOptions = [
  { value: "popular", label: "Popular" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "name", label: "A–Z" },
];

function buildQuery(params: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...params, ...overrides };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `/menu?${s}` : "/menu";
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { category, q, sort = "popular", diet } = params;

  const categories = await getCategories();

  const items = await db.menuItem.findMany({
    where: {
      ...(category ? { category: { slug: category } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
              { ingredients: { contains: q } },
            ],
          }
        : {}),
      ...(diet === "veg" ? { isVeg: true } : {}),
      ...(diet === "spicy" ? { isSpicy: true } : {}),
    },
    include: { reviews: { select: { rating: true } } },
    orderBy:
      sort === "price-asc"
        ? { price: "asc" }
        : sort === "price-desc"
          ? { price: "desc" }
          : sort === "name"
            ? { name: "asc" }
            : [{ isFeatured: "desc" }, { name: "asc" }],
  });

  const cards = items.map(toCardData);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Our Menu</h1>
        <p className="text-muted-foreground">
          {cards.length} dishes, made fresh to order.
        </p>
      </div>

      {/* Search */}
      <form action="/menu" method="get" className="mb-4 flex max-w-md gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <Input
          type="search"
          name="q"
          placeholder="Search dishes, ingredients…"
          defaultValue={q ?? ""}
          aria-label="Search menu"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {/* Category pills */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Link href={buildQuery(params, { category: undefined })}>
          <Badge
            variant={!category ? "default" : "outline"}
            className="cursor-pointer px-3 py-1.5"
          >
            All
          </Badge>
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={buildQuery(params, { category: c.slug })}>
            <Badge
              variant={category === c.slug ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5"
            >
              {c.name}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Diet + sort */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[
            { value: undefined, label: "Everything" },
            { value: "veg", label: "🌱 Vegetarian" },
            { value: "spicy", label: "🌶️ Spicy" },
          ].map((d) => (
            <Link key={d.label} href={buildQuery(params, { diet: d.value })}>
              <Badge
                variant={diet === d.value ? "secondary" : "outline"}
                className={cn(
                  "cursor-pointer px-3 py-1.5",
                  diet === d.value && "ring-1 ring-primary"
                )}
              >
                {d.label}
              </Badge>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="mr-1 text-muted-foreground">Sort:</span>
          {sortOptions.map((s) => (
            <Link
              key={s.value}
              href={buildQuery(params, { sort: s.value })}
              className={cn(
                "rounded-md px-2 py-1 hover:bg-accent",
                sort === s.value && "bg-accent font-medium text-primary"
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-20 text-center text-muted-foreground">
          <p className="mb-3">No dishes match your search.</p>
          <Button variant="outline" render={<Link href="/menu" />}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((item, i) => (
            <MenuItemCard key={item.id} item={item} seed={i} />
          ))}
        </div>
      )}
    </div>
  );
}
