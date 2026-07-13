"use server";

import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/session";

export async function login(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || user.role !== "ADMIN" || !user.passwordHash) {
    return { ok: false, error: "Invalid email or password" };
  }
  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Invalid email or password" };
  }

  const token = await createSessionToken(user.email, user.role);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return { ok: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
