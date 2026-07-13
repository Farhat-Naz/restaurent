"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function submitReview(input: {
  menuItemId: string;
  authorName: string;
  rating: number;
  comment: string;
}): Promise<{ ok: boolean; error?: string }> {
  const rating = Math.round(input.rating);
  if (rating < 1 || rating > 5) return { ok: false, error: "Invalid rating" };
  if (!input.authorName.trim() || !input.comment.trim()) {
    return { ok: false, error: "Name and comment are required" };
  }

  const item = await db.menuItem.findUnique({
    where: { id: input.menuItemId },
    select: { slug: true },
  });
  if (!item) return { ok: false, error: "Menu item not found" };

  await db.review.create({
    data: {
      menuItemId: input.menuItemId,
      authorName: input.authorName.trim().slice(0, 60),
      rating,
      comment: input.comment.trim().slice(0, 500),
    },
  });

  revalidatePath(`/menu/${item.slug}`);
  return { ok: true };
}
