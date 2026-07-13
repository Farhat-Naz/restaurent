"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

/** Clears the cart when landing on a fresh order (e.g. returning from Stripe Checkout). */
export function CartClearer() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
