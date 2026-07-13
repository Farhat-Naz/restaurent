import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/order-status";

type ChatMessage = { role: "user" | "assistant"; content: string };

const RESTAURANT_INFO = `The Golden Fork — 128 Ember Lane, Springfield. Phone +1 (555) 012-3456.
Open Mon–Sun 11:00 AM – 11:00 PM. Pickup orders only (ready in ~20 min) — no delivery service. Dine-in available.
Payments: pay at pickup (card or cash) or online by card. Table reservations at /reservations. Track orders at /track.
Active coupons: WELCOME10 (10% off, $20 min), FLAT5 ($5 off, $30 min), GOLDEN20 (20% off, $50 min).`;

export async function POST(req: Request) {
  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return NextResponse.json({ reply: "How can I help you today?" });
  }

  // 1) Order status lookup works in both modes
  const orderMatch = lastUser.content.toUpperCase().match(/GF-[A-Z0-9]{6}/);
  if (orderMatch) {
    const order = await db.order.findUnique({ where: { orderNumber: orderMatch[0] } });
    if (order) {
      return NextResponse.json({
        reply: `Order ${order.orderNumber} is currently: ${STATUS_LABELS[order.status] ?? order.status}. Total ${formatCurrency(order.total)} (${order.fulfillment === "DELIVERY" ? "delivery" : "pickup"}). You can follow it live at /orders/${order.orderNumber}.`,
      });
    }
    return NextResponse.json({
      reply: `I couldn't find an order with number ${orderMatch[0]}. Please double-check it against your confirmation.`,
    });
  }

  // 2) LLM mode when an API key is configured
  const apiKey = process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const reply = await askLlm(apiKey, messages);
      if (reply) return NextResponse.json({ reply });
    } catch (e) {
      console.error("LLM chat failed, falling back to rules:", e);
    }
  }

  // 3) Rule-based fallback (no API key needed)
  return NextResponse.json({ reply: await ruleBasedReply(lastUser.content) });
}

async function askLlm(apiKey: string, messages: ChatMessage[]): Promise<string | null> {
  const menu = await db.menuItem.findMany({
    include: { category: true },
    orderBy: { category: { sortOrder: "asc" } },
  });
  const menuText = menu
    .map(
      (m) =>
        `${m.name} (${m.category.name}, ${formatCurrency(m.price)})${m.isVeg ? " [veg]" : ""}${m.isSpicy ? " [spicy]" : ""}${m.allergens ? ` allergens: ${m.allergens}` : ""}${m.isAvailable ? "" : " [SOLD OUT]"}`
    )
    .join("\n");

  const useGateway = !!process.env.AI_GATEWAY_API_KEY;
  const res = await fetch(
    useGateway
      ? "https://ai-gateway.vercel.sh/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: useGateway ? "openai/gpt-4o-mini" : "gpt-4o-mini",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `You are Forky, the friendly support assistant for The Golden Fork restaurant. Answer briefly and helpfully. Only discuss the restaurant, its menu, orders, and reservations.\n\n${RESTAURANT_INFO}\n\nMENU:\n${menuText}`,
          },
          ...messages,
        ],
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function ruleBasedReply(text: string): Promise<string> {
  const q = text.toLowerCase();

  if (/(vegetarian|vegan|veggie)/.test(q)) {
    const items = await db.menuItem.findMany({ where: { isVeg: true, isAvailable: true }, take: 6 });
    return `Great vegetarian picks: ${items.map((i) => `${i.name} (${formatCurrency(i.price)})`).join(", ")}. Filter the full list at /menu?diet=veg.`;
  }
  if (/(spicy|hot sauce|heat)/.test(q)) {
    const items = await db.menuItem.findMany({ where: { isSpicy: true, isAvailable: true }, take: 6 });
    return `If you like it hot 🌶️: ${items.map((i) => i.name).join(", ")}. See them all at /menu?diet=spicy.`;
  }
  if (/(allerg|gluten|dairy|nut|shellfish)/.test(q)) {
    return "Every dish page lists its allergens (gluten, dairy, egg, nuts, shellfish, etc.) — open any item from /menu to check. If you have a severe allergy, add a note at checkout and our kitchen will take extra care.";
  }
  if (/(hour|open|close|when.*open|timing)/.test(q)) {
    return "We're open every day from 11:00 AM to 11:00 PM — kitchen takes last orders at 10:30 PM.";
  }
  if (/(where|location|address|direction)/.test(q)) {
    return "You'll find us at 128 Ember Lane, Springfield. Free parking behind the building!";
  }
  if (/(reserv|book|table)/.test(q)) {
    return "You can book a table in under a minute at /reservations — pick a date, time and party size. For parties of 8+, call us at +1 (555) 012-3456.";
  }
  if (/(coupon|discount|promo|offer|deal|code)/.test(q)) {
    const coupons = await db.coupon.findMany({ where: { isActive: true } });
    return `Current offers: ${coupons.map((c) => `${c.code} — ${c.type === "PERCENT" ? `${c.value}% off` : `${formatCurrency(c.value)} off`} (min ${formatCurrency(c.minSubtotal)})`).join("; ")}. Apply them at checkout!`;
  }
  if (/(deliver|shipping|how long|delivery fee)/.test(q)) {
    return "We don't offer delivery — we're pickup and dine-in only. Order online and your food is usually ready to collect in about 20 minutes at 128 Ember Lane.";
  }
  if (/(pay|payment|cash|card|cod)/.test(q)) {
    return "You can pay at pickup (card or cash at the counter), or pay online by card when placing your order.";
  }
  if (/(refund|cancel|wrong order|complain|problem)/.test(q)) {
    return "Sorry to hear that! For refunds or issues with an order, share your order number (e.g. GF-ABC123) and call us at +1 (555) 012-3456 — the team resolves most issues on the spot.";
  }
  if (/(track|status|where.*order|my order)/.test(q)) {
    return "Paste your order number here (it looks like GF-ABC123) and I'll check its status, or visit /track.";
  }
  if (/(recommend|popular|best|favorite|suggest|what should)/.test(q)) {
    const items = await db.menuItem.findMany({ where: { isFeatured: true, isAvailable: true }, take: 5 });
    return `Our guests' favorites: ${items.map((i) => `${i.name} (${formatCurrency(i.price)})`).join(", ")}. You can't go wrong with any of these!`;
  }
  if (/(hi|hello|hey|salam|assalam)/.test(q)) {
    return "Hello! 👋 Ask me about the menu, dietary options, offers, reservations — or paste an order number to track it.";
  }
  return "I can help with the menu, allergens, current offers, reservations, pickup info, and order tracking (paste a number like GF-ABC123). What would you like to know?";
}
