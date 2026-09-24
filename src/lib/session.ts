import { cookies } from "next/headers";
import { createHash } from "crypto";
import { AUTH_API_URL, fetchComTimeout, reportUpstreamFailure } from "./upstream";
import { SESSION_COOKIE } from "./session_cookie";
import type { SessionUser } from "./auth";

const isProduction = process.env.NODE_ENV === "production";

const TTL_SESSAO_OK_MS = 30000;
const TTL_SESSAO_INDISPONIVEL_MS = 10000;
const MAX_SESSOES_CACHEADAS = 500;

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export type SessionLookup =
  | { status: "authenticated"; user: SessionUser }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

interface EntradaSessao {
  resultado: SessionLookup;
  expiraEm: number;
}

const cacheSessoes = new Map<string, EntradaSessao>();

function chaveCache(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

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

/** Esquece a sessão cacheada de um token (logout) ou de todos, se omitido. */
export function invalidarCacheSessao(token?: string): void {
  if (token) cacheSessoes.delete(chaveCache(token));
  else cacheSessoes.clear();
}

async function buscarSessao(token: string): Promise<SessionLookup> {
  let res: Response;
  try {
    res = await fetchComTimeout(`${AUTH_API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
  } catch (error) {
    reportUpstreamFailure("auth", error);
    return { status: "unavailable" };
  }

  if (res.status === 401 || res.status === 403) return { status: "unauthenticated" };

  if (!res.ok) {
    reportUpstreamFailure("auth", new Error(`/auth/profile respondeu ${res.status}`));
    return { status: "unavailable" };
  }

  const data = (await res.json().catch(() => null)) as { data?: SessionUser } | null;

  if (!data?.data) {
    reportUpstreamFailure("auth", new Error("/auth/profile respondeu sem usuário"));
    return { status: "unavailable" };
  }

  return { status: "authenticated", user: data.data };
}

export async function lookupSession(): Promise<SessionLookup> {
  const token = await getSessionToken();

  if (!token) return { status: "unauthenticated" };

  const chave = chaveCache(token);
  const emCache = cacheSessoes.get(chave);

  if (emCache && emCache.expiraEm > Date.now()) return emCache.resultado;

  const resultado = await buscarSessao(token);

  if (resultado.status === "authenticated") {
    cacheSessoes.set(chave, { resultado, expiraEm: Date.now() + TTL_SESSAO_OK_MS });
  } else if (resultado.status === "unavailable") {
    cacheSessoes.set(chave, { resultado, expiraEm: Date.now() + TTL_SESSAO_INDISPONIVEL_MS });
  } else {
    cacheSessoes.delete(chave);
  }

  if (cacheSessoes.size > MAX_SESSOES_CACHEADAS) cacheSessoes.clear();

  return resultado;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const resultado = await lookupSession();
  return resultado.status === "authenticated" ? resultado.user : null;
}
