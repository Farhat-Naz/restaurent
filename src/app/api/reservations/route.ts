import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    date?: string;
    time?: string;
    guests?: number;
    specialRequest?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, phone, date, time } = body;
  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "Invalid time" }, { status: 400 });
  }
  const guests = Math.max(1, Math.min(12, Math.round(Number(body.guests) || 2)));

  const reservation = await db.reservation.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date,
      time,
      guests,
      specialRequest: body.specialRequest?.trim() || null,
    },
  });

  return NextResponse.json({ id: reservation.id }, { status: 201 });
}
