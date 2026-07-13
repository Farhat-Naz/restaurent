import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { couponDiscount, round2, TAX_RATE } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe";

type IncomingLine = {
  itemId: string;
  size: string | null;
  addons: string[];
  quantity: number;
};

type IncomingOrder = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: "PAY_AT_RESTAURANT" | "CARD";
  notes?: string;
  tip?: number;
  couponCode?: string;
  lines: IncomingLine[];
};

function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `GF-${s}`;
}

export async function POST(req: Request) {
  let body: IncomingOrder;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.customerName?.trim() || !body.customerEmail?.trim() || !body.customerPhone?.trim()) {
    return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
  }
  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (!["PAY_AT_RESTAURANT", "CARD"].includes(body.paymentMethod)) {
    return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
  }
  const stripe = body.paymentMethod === "CARD" ? getStripe() : null;
  if (body.paymentMethod === "CARD" && !stripe) {
    return NextResponse.json(
      { error: "Online card payments are not configured yet" },
      { status: 400 }
    );
  }

  // Recompute all prices server-side — never trust client totals
  const menuItems = await db.menuItem.findMany({
    where: { id: { in: body.lines.map((l) => l.itemId) } },
  });
  const itemMap = new Map(menuItems.map((m) => [m.id, m]));

  const orderItems: {
    menuItemId: string;
    name: string;
    size: string | null;
    addons: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[] = [];

  for (const line of body.lines) {
    const item = itemMap.get(line.itemId);
    if (!item) {
      return NextResponse.json({ error: "A cart item no longer exists" }, { status: 400 });
    }
    if (!item.isAvailable) {
      return NextResponse.json({ error: `${item.name} is sold out` }, { status: 400 });
    }
    const quantity = Math.max(1, Math.min(50, Math.round(line.quantity)));

    let unitPrice = item.price;
    if (line.size) {
      const sizes: { name: string; priceDelta: number }[] = item.sizes
        ? JSON.parse(item.sizes)
        : [];
      const size = sizes.find((s) => s.name === line.size);
      if (!size) {
        return NextResponse.json({ error: `Invalid size for ${item.name}` }, { status: 400 });
      }
      unitPrice += size.priceDelta;
    }
    const addonDefs: { name: string; price: number }[] = item.addons
      ? JSON.parse(item.addons)
      : [];
    for (const addonName of line.addons ?? []) {
      const addon = addonDefs.find((a) => a.name === addonName);
      if (!addon) {
        return NextResponse.json({ error: `Invalid add-on for ${item.name}` }, { status: 400 });
      }
      unitPrice += addon.price;
    }
    unitPrice = round2(unitPrice);

    orderItems.push({
      menuItemId: item.id,
      name: item.name,
      size: line.size ?? null,
      addons: line.addons?.length ? JSON.stringify(line.addons) : null,
      unitPrice,
      quantity,
      lineTotal: round2(unitPrice * quantity),
    });
  }

  const subtotal = round2(orderItems.reduce((s, i) => s + i.lineTotal, 0));

  let discount = 0;
  let couponCode: string | null = null;
  if (body.couponCode?.trim()) {
    const coupon = await db.coupon.findUnique({
      where: { code: body.couponCode.trim().toUpperCase() },
    });
    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > new Date())
    ) {
      discount = couponDiscount(coupon, subtotal);
      if (discount > 0) couponCode = coupon.code;
    }
  }

  const tax = round2((subtotal - discount) * TAX_RATE);
  const tip = round2(Math.max(0, Math.min(500, Number(body.tip) || 0)));
  const total = round2(subtotal - discount + tax + tip);

  // Retry a few times in the unlikely event of an order-number collision
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const order = await db.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName: body.customerName.trim(),
          customerEmail: body.customerEmail.trim(),
          customerPhone: body.customerPhone.trim(),
          fulfillment: "PICKUP",
          paymentMethod: body.paymentMethod,
          notes: body.notes?.trim() || null,
          subtotal,
          tax,
          discount,
          tip,
          total,
          couponCode,
          items: { create: orderItems },
        },
      });

      // Card payments: hand off to Stripe Checkout; webhook marks the order paid
      if (stripe) {
        const origin =
          req.headers.get("origin") ??
          process.env.NEXT_PUBLIC_APP_URL ??
          "http://localhost:3000";
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `The Golden Fork — Order ${order.orderNumber}`,
                  description: orderItems
                    .map((i) => `${i.quantity}× ${i.name}`)
                    .join(", ")
                    .slice(0, 500),
                },
                unit_amount: Math.round(total * 100),
              },
              quantity: 1,
            },
          ],
          metadata: { orderNumber: order.orderNumber },
          customer_email: order.customerEmail,
          success_url: `${origin}/orders/${order.orderNumber}?new=1`,
          cancel_url: `${origin}/checkout?cancelled=1`,
        });
        return NextResponse.json(
          { orderNumber: order.orderNumber, checkoutUrl: session.url },
          { status: 201 }
        );
      }

      return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
    } catch (e: unknown) {
      const isUniqueViolation =
        typeof e === "object" && e !== null && "code" in e && e.code === "P2002";
      if (!isUniqueViolation) throw e;
    }
  }
  return NextResponse.json({ error: "Could not create order, please retry" }, { status: 500 });
}
