"use client";

import { CalendarCheck, Clock, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const timeSlots = [
  "11:30", "12:00", "12:30", "13:00", "13:30", "14:00",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

export default function ReservationsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState(2);
  const [specialRequest, setSpecialRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in your name, email and phone");
      return;
    }
    if (date < today) {
      toast.error("Please pick a date in the future");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, date, time, guests, specialRequest }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create reservation");
        return;
      }
      setConfirmed(data.id);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <CalendarCheck className="mb-4 size-14 text-green-600" />
        <h1 className="text-3xl font-bold tracking-tight">Request received!</h1>
        <p className="mt-3 text-muted-foreground">
          Thanks {name.split(" ")[0]} — your table for {guests} on{" "}
          <span className="font-medium text-foreground">{date}</span> at{" "}
          <span className="font-medium text-foreground">{time}</span> is pending
          confirmation. We&apos;ll reach out at {phone} shortly.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setConfirmed(null)}>
          Make another reservation
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Reserve a Table</h1>
        <p className="mt-2 text-muted-foreground">
          Book your spot at The Golden Fork. Parties of 8+? Call us at +1 (555) 012-3456.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" /> Booking details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="res-name">Full name</Label>
                <Input id="res-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-phone">Phone</Label>
                <Input id="res-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="res-email">Email</Label>
              <Input id="res-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="res-date">Date</Label>
                <Input
                  id="res-date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-guests">Guests</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGuests(g)}
                      className={cn(
                        "size-9 rounded-lg border text-sm transition-colors",
                        guests === g
                          ? "border-primary bg-primary/10 font-semibold text-primary"
                          : "hover:bg-accent"
                      )}
                      aria-label={`${g} guests`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="size-4" /> Time
              </Label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      time === t
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="res-request">Special requests (optional)</Label>
              <Textarea
                id="res-request"
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder="Birthday, window seat, high chair, allergies…"
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Booking…" : `Request Table for ${guests}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
