import { cn } from "@/lib/utils";

const gradients = [
  "from-orange-100 to-amber-200 dark:from-orange-950 dark:to-amber-900",
  "from-rose-100 to-orange-200 dark:from-rose-950 dark:to-orange-900",
  "from-amber-100 to-yellow-200 dark:from-amber-950 dark:to-yellow-900",
  "from-lime-100 to-emerald-200 dark:from-lime-950 dark:to-emerald-900",
];

/** Emoji-based food visual. Swap for real images (Cloudinary/Blob) later. */
export function FoodImage({
  emoji,
  seed = 0,
  className,
  emojiClassName,
}: {
  emoji: string | null;
  seed?: number;
  className?: string;
  emojiClassName?: string;
}) {
  const gradient = gradients[Math.abs(seed) % gradients.length];
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br select-none",
        gradient,
        className
      )}
      aria-hidden="true"
    >
      <span className={cn("text-5xl drop-shadow-sm", emojiClassName)}>
        {emoji ?? "🍽️"}
      </span>
    </div>
  );
}
