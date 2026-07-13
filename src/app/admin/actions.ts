"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ORDER_STATUSES } from "@/lib/order-status";

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  if (![...ORDER_STATUSES, "CANCELLED"].includes(status)) {
    return { ok: false as const, error: "Invalid status" };
  }
  await db.order.update({
    where: { id: orderId },
    data: {
      status,
      // COD orders settle on delivery/pickup
      ...(status === "DELIVERED" ? { paymentStatus: "PAID" } : {}),
    },
  });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function updateReservationStatus(id: string, status: string) {
  await requireAdmin();
  if (!["PENDING", "CONFIRMED", "CANCELLED", "SEATED", "COMPLETED"].includes(status)) {
    return { ok: false as const, error: "Invalid status" };
  }
  await db.reservation.update({ where: { id }, data: { status } });
  revalidatePath("/admin/reservations");
  return { ok: true as const };
}

export async function toggleItemAvailability(id: string) {
  await requireAdmin();
  const item = await db.menuItem.findUnique({ where: { id } });
  if (!item) return { ok: false as const, error: "Item not found" };
  await db.menuItem.update({
    where: { id },
    data: { isAvailable: !item.isAvailable },
  });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return { ok: true as const };
}

export async function toggleItemFeatured(id: string) {
  await requireAdmin();
  const item = await db.menuItem.findUnique({ where: { id } });
  if (!item) return { ok: false as const, error: "Item not found" };
  await db.menuItem.update({
    where: { id },
    data: { isFeatured: !item.isFeatured },
  });
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateItemPrice(id: string, price: number) {
  await requireAdmin();
  if (!Number.isFinite(price) || price <= 0 || price > 999) {
    return { ok: false as const, error: "Invalid price" };
  }
  await db.menuItem.update({
    where: { id },
    data: { price: Math.round(price * 100) / 100 },
  });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return { ok: true as const };
}

export async function createMenuItem(input: {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  isVeg: boolean;
  isSpicy: boolean;
}) {
  await requireAdmin();
  const name = input.name.trim();
  if (!name || !input.description.trim()) {
    return { ok: false as const, error: "Name and description are required" };
  }
  if (!Number.isFinite(input.price) || input.price <= 0 || input.price > 999) {
    return { ok: false as const, error: "Invalid price" };
  }
  const category = await db.category.findUnique({ where: { id: input.categoryId } });
  if (!category) return { ok: false as const, error: "Pick a category" };

  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let slug = baseSlug;
  for (let i = 2; await db.menuItem.findUnique({ where: { slug } }); i++) {
    slug = `${baseSlug}-${i}`;
  }

  await db.menuItem.create({
    data: {
      name,
      slug,
      description: input.description.trim(),
      price: Math.round(input.price * 100) / 100,
      categoryId: input.categoryId,
      image: input.image.trim() || "🍽️",
      isVeg: input.isVeg,
      isSpicy: input.isSpicy,
    },
  });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return { ok: true as const };
}

export async function deleteMenuItem(id: string) {
  await requireAdmin();
  const orderCount = await db.orderItem.count({ where: { menuItemId: id } });
  if (orderCount > 0) {
    // Keep history intact — hide the item instead of deleting it
    await db.menuItem.update({ where: { id }, data: { isAvailable: false } });
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return {
      ok: true as const,
      note: "Item has past orders, so it was marked unavailable instead of deleted.",
    };
  }
  await db.menuItem.delete({ where: { id } });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return { ok: true as const };
}
