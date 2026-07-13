"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FoodImage } from "@/components/food-image";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/format";

export function CartSheet() {
  const { lines, setQuantity, removeLine } = useCart();
  const [open, setOpen] = useState(false);
  // Avoid hydration mismatch: cart is persisted in localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? cartCount(lines) : 0;
  const subtotal = cartSubtotal(lines);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" className="relative" aria-label="Open cart" />
        }
      >
        <ShoppingBag className="size-5" />
        {count > 0 && (
          <Badge className="absolute -right-2 -top-2 size-5 justify-center rounded-full p-0 text-[10px]">
            {count}
          </Badge>
        )}
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart {count > 0 && `(${count})`}</SheetTitle>
        </SheetHeader>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <ShoppingBag className="size-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button
              variant="outline"
              render={<Link href="/menu" />}
              onClick={() => setOpen(false)}
            >
              Browse the menu
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-4">
              {lines.map((line, i) => (
                <div key={line.key} className="flex gap-3">
                  <FoodImage
                    emoji={line.image}
                    seed={i}
                    className="size-16 shrink-0 rounded-lg"
                    emojiClassName="text-3xl"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-tight">{line.name}</span>
                      <button
                        onClick={() => removeLine(line.key)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${line.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {(line.size || line.addons.length > 0) && (
                      <span className="text-xs text-muted-foreground">
                        {[line.size, ...line.addons].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-6"
                          onClick={() => setQuantity(line.key, line.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-5 text-center text-sm">{line.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-6"
                          onClick={() => setQuantity(line.key, line.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <SheetFooter className="mt-0">
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-base font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Taxes and discounts calculated at checkout.
              </p>
              <Button
                size="lg"
                render={<Link href="/checkout" />}
                onClick={() => setOpen(false)}
              >
                Go to Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
