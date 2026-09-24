import { NextResponse } from "next/server";
import { AUTH_API_URL, fetchComTimeout } from "@/lib/upstream";
import { clearSessionCookie, getSessionToken, invalidarCacheSessao } from "@/lib/session";

export async function POST() {
  const token = await getSessionToken();

  if (token) {
    invalidarCacheSessao(token);

    await fetchComTimeout(`${AUTH_API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    }).catch(() => null);
  }

  await clearSessionCookie();

  return NextResponse.json({ success: true });
}
