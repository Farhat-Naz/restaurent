import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "./admin-nav";
import { LogoutButton } from "./logout-button";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Restaurant Admin</h1>
          <p className="text-sm text-muted-foreground">
            {session ? `Signed in as ${session.email}` : "Manage orders, menu, and reservations."}
          </p>
        </div>
        {session && <LogoutButton />}
      </div>
      <AdminNav />
      <div className="mt-6">{children}</div>
    </div>
  );
}
