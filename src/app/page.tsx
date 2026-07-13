import Link from "next/link";
import {
  Bike,
  CalendarCheck,
  ChefHat,
  Clock,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FoodImage } from "@/components/food-image";
import { MenuItemCard } from "@/components/menu-item-card";
import { StarRating } from "@/components/star-rating";
import { db } from "@/lib/db";
import { getCategories, getFeaturedItems } from "@/lib/queries";

export const dynamic = "force-dynamic";

const categoryEmojis: Record<string, string> = {
  starters: "🥟",
  burgers: "🍔",
  pizza: "🍕",
  pasta: "🍝",
  mains: "🥩",
  desserts: "🍰",
  drinks: "🥤",
};

export default async function HomePage() {
  const [categories, featured, reviews] = await Promise.all([
    getCategories(),
    getFeaturedItems(),
    db.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { menuItem: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-background dark:from-orange-950/40 dark:via-amber-950/20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> Now delivering across Springfield
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Honest food,
              <br />
              <span className="text-primary">delivered warm.</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Smash burgers, wood-fired pizza, and slow-cooked classics — made
              fresh daily at The Golden Fork. Order in minutes, track it to
              your door.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/menu" />}>
                Order Now
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/reservations" />}>
                <CalendarCheck className="size-4" /> Reserve a Table
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 text-primary" /> 30 min avg delivery
              </span>
              <span className="flex items-center gap-1.5">
                <Bike className="size-4 text-primary" /> Free delivery over $35
              </span>
              <span className="flex items-center gap-1.5">
                <ChefHat className="size-4 text-primary" /> Fresh, never frozen
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["🍔", "🍕", "🍝", "🥩", "🍰", "🥤"].map((e, i) => (
              <FoodImage
                key={e}
                emoji={e}
                seed={i}
                className={`aspect-square rounded-3xl ${i === 0 ? "col-span-2 row-span-2 aspect-auto" : ""}`}
                emojiClassName={i === 0 ? "text-8xl" : "text-5xl"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Browse by Category</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/menu?category=${c.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <span className="text-3xl transition-transform group-hover:scale-110">
                {categoryEmojis[c.slug] ?? "🍽️"}
              </span>
              <span className="text-center text-xs font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-muted/40 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Chef&apos;s Favorites</h2>
              <p className="text-muted-foreground">The dishes our regulars can&apos;t stop ordering.</p>
            </div>
            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              render={<Link href="/menu" />}
            >
              View full menu →
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item, i) => (
              <MenuItemCard key={item.id} item={item} seed={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo strip */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-primary px-8 py-8 text-primary-foreground md:flex-row">
          <div className="flex items-center gap-4">
            <TicketPercent className="size-10 shrink-0" />
            <div>
              <h3 className="text-xl font-bold">First order? Take 10% off.</h3>
              <p className="opacity-90">
                Use code <span className="font-mono font-bold">WELCOME10</span> at checkout on orders over $20.
              </p>
            </div>
          </div>
          <Button size="lg" variant="secondary" render={<Link href="/menu" />}>
            Claim it now
          </Button>
        </div>
      </section>

      {/* Story */}
      <section id="about" className="bg-muted/40 py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <FoodImage emoji="👨‍🍳" seed={2} className="h-72 rounded-3xl" emojiClassName="text-9xl" />
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Our Story</h2>
            <p className="text-muted-foreground">
              The Golden Fork started in 2012 as a six-table neighborhood
              kitchen. Head chef Marco Bellini still hand-rolls the pizza dough
              every morning and sources produce from farms within 50 miles.
            </p>
            <p className="text-muted-foreground">
              Today we serve thousands of guests a month — in our dining room
              and at doorsteps across the city — without cutting a single
              corner on the food.
            </p>
            <Button variant="outline" render={<Link href="/reservations" />}>
              Book your visit
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">What Guests Say</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-3">
                <StarRating rating={r.rating} />
                <p className="text-sm">&ldquo;{r.comment}&rdquo;</p>
                <p className="text-xs text-muted-foreground">
                  — {r.authorName}, on <span className="font-medium">{r.menuItem.name}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
