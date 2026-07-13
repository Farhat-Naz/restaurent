import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await req.text(),
      signature,
      webhookSecret
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderNumber = session.metadata?.orderNumber;
    if (orderNumber) {
      const order = await db.order.findUnique({ where: { orderNumber } });
      if (order && order.paymentStatus !== "PAID") {
        await db.order.update({
          where: { orderNumber },
          data: {
            paymentStatus: "PAID",
            // Paid orders skip straight to CONFIRMED
            ...(order.status === "RECEIVED" ? { status: "CONFIRMED" } : {}),
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
