import { cookies } from "next/headers";
import { AUTH_API_URL } from "./upstream";
import { SESSION_COOKIE } from "./session_cookie";
import type { SessionUser } from "./auth";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value || null;
}

export async function setSessionCookie(token: string, expiresAt?: string | null): Promise<void> {
  const store = await cookies();
  const maxAge = expiresAt
    ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
    : undefined;

  store.set(SESSION_COOKIE, token, { ...cookieOptions, ...(maxAge ? { maxAge } : {}) });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const res = await fetch(`${AUTH_API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = (await res.json().catch(() => null)) as { data?: SessionUser } | null;
    return data?.data ?? null;
  } catch {
    return null;
  }
}
