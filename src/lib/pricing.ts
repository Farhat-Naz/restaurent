export const TAX_RATE = 0.08;

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function couponDiscount(
  coupon: { type: string; value: number; minSubtotal: number },
  subtotal: number
): number {
  if (subtotal < coupon.minSubtotal) return 0;
  const discount =
    coupon.type === "PERCENT" ? (subtotal * coupon.value) / 100 : coupon.value;
  return round2(Math.min(discount, subtotal));
}
