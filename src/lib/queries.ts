import { db } from "@/lib/db";
import type { MenuItemCardData } from "@/components/menu-item-card";

type ItemWithReviews = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
  isVeg: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  reviews: { rating: number }[];
};

export function toCardData(item: ItemWithReviews): MenuItemCardData {
  const reviewCount = item.reviews.length;
  const avgRating =
    reviewCount > 0
      ? item.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
      : null;
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    price: item.price,
    image: item.image,
    isVeg: item.isVeg,
    isSpicy: item.isSpicy,
    isAvailable: item.isAvailable,
    avgRating,
    reviewCount,
  };
}

export async function getCategories() {
  return db.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getFeaturedItems() {
  const items = await db.menuItem.findMany({
    where: { isFeatured: true, isAvailable: true },
    include: { reviews: { select: { rating: true } } },
    take: 6,
  });
  return items.map(toCardData);
}
