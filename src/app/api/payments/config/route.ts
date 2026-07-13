import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    cardEnabled: Boolean(process.env.STRIPE_SECRET_KEY),
  });
}
