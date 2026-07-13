import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Flame, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddToCart, type AddonOption, type SizeOption } from "@/components/add-to-cart";
import { FoodImage } from "@/components/food-image";
import { MenuItemCard } from "@/components/menu-item-card";
import { StarRating } from "@/components/star-rating";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { toCardData } from "@/lib/queries";
import { ReviewForm } from "./review-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await db.menuItem.findUnique({ where: { slug } });
  return {
    title: item?.name ?? "Menu",
    description: item?.description,
  };
}

function parseJson<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function FoodDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await db.menuItem.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!item) notFound();

  const sizes = parseJson<SizeOption>(item.sizes);
  const addons = parseJson<AddonOption>(item.addons);
  const avgRating =
    item.reviews.length > 0
      ? item.reviews.reduce((s, r) => s + r.rating, 0) / item.reviews.length
      : null;

  const related = (
    await db.menuItem.findMany({
      where: { categoryId: item.categoryId, id: { not: item.id }, isAvailable: true },
      include: { reviews: { select: { rating: true } } },
      take: 3,
    })
  ).map(toCardData);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/menu" className="hover:text-primary">Menu</Link>
        <ChevronRight className="size-4" />
        <Link href={`/menu?category=${item.category.slug}`} className="hover:text-primary">
          {item.category.name}
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{item.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <FoodImage
          emoji={item.image}
          seed={item.name.length}
          className="h-80 rounded-3xl lg:h-[26rem]"
          emojiClassName="text-[10rem]"
        />

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {item.isVeg && (
              <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                <Leaf className="size-3" /> Vegetarian
              </Badge>
            )}
            {item.isSpicy && (
              <Badge variant="outline" className="border-red-400 text-red-500">
                <Flame className="size-3" /> Spicy
              </Badge>
            )}
            {item.calories != null && (
              <Badge variant="secondary">{item.calories} kcal</Badge>
            )}
            {!item.isAvailable && <Badge variant="destructive">Sold out</Badge>}
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
            {avgRating !== null && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <StarRating rating={avgRating} />
                <span>
                  {avgRating.toFixed(1)} · {item.reviews.length} review
                  {item.reviews.length !== 1 && "s"}
                </span>
              </div>
            )}
          </div>

          <p className="text-muted-foreground">{item.description}</p>
          <p className="text-3xl font-bold">
            {formatCurrency(item.price)}
            {sizes.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">base price</span>
            )}
          </p>

          <AddToCart
            item={{
              id: item.id,
              slug: item.slug,
              name: item.name,
              image: item.image,
              price: item.price,
              isAvailable: item.isAvailable,
            }}
            sizes={sizes}
            addons={addons}
          />

          <Separator />

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            {item.ingredients && (
              <div>
                <h3 className="mb-1 font-semibold">Ingredients</h3>
                <p className="text-muted-foreground">{item.ingredients}</p>
              </div>
            )}
            <div>
              <h3 className="mb-1 font-semibold">Allergens</h3>
              <p className="text-muted-foreground">
                {item.allergens ? item.allergens : "None"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">
            Reviews {item.reviews.length > 0 && `(${item.reviews.length})`}
          </h2>
          {item.reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet — be the first!</p>
          ) : (
            item.reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{r.authorName}</span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))
          )}
        </div>
        <ReviewForm menuItemId={item.id} />
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-xl font-bold tracking-tight">You might also like</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <MenuItemCard key={r.id} item={r} seed={i + 1} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
