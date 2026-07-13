"use client";

import { Star } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitReview } from "./actions";

export function ReviewForm({ menuItemId }: { menuItemId: string }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4 rounded-2xl border p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !comment.trim()) {
          toast.error("Please add your name and a short comment");
          return;
        }
        startTransition(async () => {
          const result = await submitReview({
            menuItemId,
            authorName: name.trim(),
            rating,
            comment: comment.trim(),
          });
          if (result.ok) {
            toast.success("Thanks for your review!");
            setName("");
            setComment("");
            setRating(5);
          } else {
            toast.error(result.error ?? "Could not submit review");
          }
        });
      }}
    >
      <h3 className="font-semibold">Leave a review</h3>
      <div className="space-y-2">
        <Label>Your rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="review-name">Name</Label>
          <Input
            id="review-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={60}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-comment">Comment</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was it?"
          maxLength={500}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
