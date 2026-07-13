"use client";

import { Plus, Star, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  toggleItemFeatured,
} from "../actions";

export function AvailabilityToggle({
  itemId,
  isAvailable,
}: {
  itemId: string;
  isAvailable: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleItemAvailability(itemId);
        })
      }
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        isAvailable
          ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400"
          : "bg-red-500/10 text-red-500 hover:bg-red-500/20",
        pending && "opacity-50"
      )}
    >
      {isAvailable ? "Available" : "Sold out"}
    </button>
  );
}

export function FeaturedToggle({
  itemId,
  isFeatured,
}: {
  itemId: string;
  isFeatured: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={isFeatured ? "Remove from featured" : "Mark as featured"}
      onClick={() =>
        startTransition(async () => {
          await toggleItemFeatured(itemId);
        })
      }
      className={cn("transition-opacity", pending && "opacity-50")}
    >
      <Star
        className={cn(
          "size-5",
          isFeatured ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40 hover:text-muted-foreground"
        )}
      />
    </button>
  );
}

export function DeleteItemButton({ itemId, name }: { itemId: string; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Delete ${name}`}
      onClick={() => {
        if (!confirm(`Delete "${name}" from the menu?`)) return;
        startTransition(async () => {
          const result = await deleteMenuItem(itemId);
          if (result.ok) {
            toast.success("note" in result && result.note ? result.note : `${name} deleted`);
          } else {
            toast.error("Could not delete item");
          }
        });
      }}
      className={cn(
        "text-muted-foreground transition-colors hover:text-destructive",
        pending && "opacity-50"
      )}
    >
      <Trash2 className="size-4" />
    </button>
  );
}

export function AddItemDialog({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [image, setImage] = useState("🍽️");
  const [isVeg, setIsVeg] = useState(false);
  const [isSpicy, setIsSpicy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createMenuItem({
        name,
        description,
        price: parseFloat(price),
        categoryId,
        image,
        isVeg,
        isSpicy,
      });
      if (result.ok) {
        toast.success(`${name} added to the menu`);
        setOpen(false);
        setName("");
        setDescription("");
        setPrice("");
        setImage("🍽️");
        setIsVeg(false);
        setIsSpicy(false);
      } else {
        toast.error(result.error ?? "Could not add item");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" /> Add Item
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New menu item</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_5rem]">
            <div className="space-y-2">
              <Label htmlFor="item-name">Name</Label>
              <Input id="item-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Truffle Fries" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-emoji">Emoji</Label>
              <Input id="item-emoji" value={image} onChange={(e) => setImage(e.target.value)} className="text-center" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-desc">Description</Label>
            <Textarea
              id="item-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hand-cut fries with truffle oil and parmesan…"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="item-price">Price ($)</Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                className="size-4 accent-primary"
              />
              🌱 Vegetarian
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSpicy}
                onChange={(e) => setIsSpicy(e.target.checked)}
                className="size-4 accent-primary"
              />
              🌶️ Spicy
            </label>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Adding…" : "Add to menu"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
