"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export type SizeOption = { name: string; priceDelta: number };
export type AddonOption = { name: string; price: number };

export function AddToCart({
  item,
  sizes,
  addons,
}: {
  item: {
    id: string;
    slug: string;
    name: string;
    image: string | null;
    price: number;
    isAvailable: boolean;
  };
  sizes: SizeOption[];
  addons: AddonOption[];
}) {
  const addLine = useCart((s) => s.addLine);
  const [size, setSize] = useState<SizeOption | null>(sizes[0] ?? null);
  const [selectedAddons, setSelectedAddons] = useState<AddonOption[]>([]);
  const [quantity, setQuantity] = useState(1);

  const unitPrice =
    item.price +
    (size?.priceDelta ?? 0) +
    selectedAddons.reduce((s, a) => s + a.price, 0);

  function toggleAddon(addon: AddonOption) {
    setSelectedAddons((cur) =>
      cur.some((a) => a.name === addon.name)
        ? cur.filter((a) => a.name !== addon.name)
        : [...cur, addon]
    );
  }

  function add() {
    addLine({
      itemId: item.id,
      slug: item.slug,
      name: item.name,
      image: item.image,
      unitPrice,
      quantity,
      size: size?.name ?? null,
      addons: selectedAddons.map((a) => a.name),
    });
    toast.success(`${quantity} × ${item.name} added to cart`);
  }

  if (!item.isAvailable) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-center text-muted-foreground">
        This dish is currently sold out. Check back soon!
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {sizes.length > 0 && (
        <div className="space-y-2">
          <Label>Size</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm transition-colors",
                  size?.name === s.name
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "hover:bg-accent"
                )}
              >
                {s.name}
                {s.priceDelta > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    +{formatCurrency(s.priceDelta)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {addons.length > 0 && (
        <div className="space-y-2">
          <Label>Extras & Add-ons</Label>
          <div className="flex flex-wrap gap-2">
            {addons.map((a) => {
              const active = selectedAddons.some((x) => x.name === a.name);
              return (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => toggleAddon(a)}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm transition-colors",
                    active
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "hover:bg-accent"
                  )}
                >
                  {a.name}
                  <span className="ml-1 text-xs text-muted-foreground">
                    +{formatCurrency(a.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-xl border px-3 py-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="text-muted-foreground hover:text-foreground"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-6 text-center font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button size="lg" className="flex-1" onClick={add}>
          <ShoppingBag className="size-4" />
          Add to cart — {formatCurrency(unitPrice * quantity)}
        </Button>
      </div>
    </div>
  );
}
