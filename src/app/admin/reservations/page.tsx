import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { RESERVATION_STATUS_LABELS } from "@/lib/order-status";
import { ReservationActions } from "./reservation-actions";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "default",
  CONFIRMED: "secondary",
  SEATED: "secondary",
  COMPLETED: "outline",
  CANCELLED: "destructive",
};

export default async function AdminReservationsPage() {
  const reservations = await db.reservation.findMany({
    orderBy: [{ date: "asc" }, { time: "asc" }],
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Reservations ({reservations.length})</h2>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="text-center">Party</TableHead>
              <TableHead>Request</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No reservations yet — bookings from the website will appear here.
                </TableCell>
              </TableRow>
            )}
            {reservations.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.phone}</p>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{r.date}</p>
                  <p className="text-xs text-muted-foreground">{r.time}</p>
                </TableCell>
                <TableCell className="text-center">{r.guests}</TableCell>
                <TableCell className="max-w-48">
                  <p className="truncate text-sm text-muted-foreground">
                    {r.specialRequest ?? "—"}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[r.status] ?? "outline"}>
                    {RESERVATION_STATUS_LABELS[r.status] ?? r.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ReservationActions reservationId={r.id} status={r.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
