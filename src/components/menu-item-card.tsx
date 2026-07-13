"use client";

import Link from "next/link";
import { Flame, Leaf, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FoodImage } from "@/components/food-image";
import { StarRating } from "@/components/star-rating";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/format";

export type MenuItemCardData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
  isVeg: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  avgRating: number | null;
  reviewCount: number;
};

export function MenuItemCard({ item, seed }: { item: MenuItemCardData; seed: number }) {
  const addLine = useCart((s) => s.addLine);

  function quickAdd() {
    addLine({
      itemId: item.id,
      slug: item.slug,
      name: item.name,
      image: item.image,
      unitPrice: item.price,
      quantity: 1,
      size: null,
      addons: [],
    });
    toast.success(`${item.name} added to cart`);
  }

  return (
    <Card className="group overflow-hidden py-0 gap-0 transition-shadow hover:shadow-lg">
      <Link href={`/menu/${item.slug}`} className="block">
        <FoodImage
          emoji={item.image}
          seed={seed}
          className="h-40 w-full transition-transform duration-300 group-hover:scale-[1.02]"
          emojiClassName="text-6xl"
        />
      </Link>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/menu/${item.slug}`} className="font-semibold leading-tight hover:text-primary">
            {item.name}
          </Link>
          <div className="flex shrink-0 gap-1">
            {item.isVeg && (
              <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400 px-1.5">
                <Leaf className="size-3" />
              </Badge>
            )}
            {item.isSpicy && (
              <Badge variant="outline" className="border-red-400 text-red-500 px-1.5">
                <Flame className="size-3" />
              </Badge>
            )}
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        {item.reviewCount > 0 && item.avgRating !== null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <StarRating rating={item.avgRating} />
            <span>({item.reviewCount})</span>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-lg font-bold">{formatCurrency(item.price)}</span>
          {item.isAvailable ? (
            <Button size="sm" onClick={quickAdd}>
              <Plus className="size-4" /> Add
            </Button>
          ) : (
            <Badge variant="secondary">Sold out</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
