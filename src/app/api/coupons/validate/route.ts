import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { couponDiscount } from "@/lib/pricing";

export async function POST(req: Request) {
  let body: { code?: string; subtotal?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase();
  const subtotal = Number(body.subtotal) || 0;
  if (!code) {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
  }

  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive || (coupon.expiresAt && coupon.expiresAt <= new Date())) {
    return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 404 });
  }
  if (subtotal < coupon.minSubtotal) {
    return NextResponse.json(
      { error: `This coupon requires a minimum order of $${coupon.minSubtotal.toFixed(2)}` },
      { status: 400 }
    );
  }

  return NextResponse.json({
    code: coupon.code,
    discount: couponDiscount(coupon, subtotal),
  });
}
