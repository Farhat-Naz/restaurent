import Link from "next/link";
import { Clock, MapPin, Phone, UtensilsCrossed } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UtensilsCrossed className="size-4" />
            </span>
            The Golden Fork
          </div>
          <p className="text-sm text-muted-foreground">
            Honest food, warm hospitality. Serving Springfield since 2012 — now
            delivering to your door.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold">Visit Us</h3>
          <p className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" /> 128 Ember Lane, Springfield
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4 shrink-0" /> +1 (555) 012-3456
          </p>
          <p className="flex items-start gap-2 text-muted-foreground">
            <Clock className="mt-0.5 size-4 shrink-0" />
            Mon–Sun: 11:00 AM – 11:00 PM
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold">Quick Links</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/menu" className="hover:text-primary">Menu</Link></li>
            <li><Link href="/reservations" className="hover:text-primary">Reserve a Table</Link></li>
            <li><Link href="/track" className="hover:text-primary">Track Your Order</Link></li>
            <li><Link href="/admin" className="hover:text-primary">Admin Dashboard</Link></li>
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold">Get 10% Off</h3>
          <p className="text-muted-foreground">
            Join our newsletter for offers and new dishes. Use code{" "}
            <span className="font-mono font-semibold text-foreground">WELCOME10</span>{" "}
            on your first order.
          </p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} The Golden Fork. All rights reserved.
      </div>
    </footer>
  );
}
