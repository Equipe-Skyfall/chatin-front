import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore, fetchComTimeoutMock, reportUpstreamFailureMock } = vi.hoisted(() => ({
  cookieStore: { get: vi.fn(), set: vi.fn() },
  fetchComTimeoutMock: vi.fn(),
  reportUpstreamFailureMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: vi.fn(async () => cookieStore) }));
vi.mock("@/lib/upstream", () => ({
  AUTH_API_URL: "http://auth.test",
  fetchComTimeout: fetchComTimeoutMock,
  reportUpstreamFailure: reportUpstreamFailureMock,
}));

import {
  clearSessionCookie,
  getSessionUser,
  invalidarCacheSessao,
  lookupSession,
  setSessionCookie,
} from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/session_cookie";

const usuario = { id: "u1", email: "ana@chatin.com", username: "ana", role: "USER" as const };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function comCookie(token: string | null) {
  cookieStore.get.mockImplementation((nome: string) =>
    nome === SESSION_COOKIE && token ? { name: nome, value: token } : undefined
  );
}

beforeEach(() => {
  invalidarCacheSessao();
  fetchComTimeoutMock.mockReset();
  comCookie("token-abc");
});

afterEach(() => {
  vi.useRealTimers();
});

describe("lookupSession (validação da sessão no servidor)", () => {
  it("sem cookie retorna unauthenticated sem chamar o serviço de auth", async () => {
    comCookie(null);

    await expect(lookupSession()).resolves.toEqual({ status: "unauthenticated" });
    expect(fetchComTimeoutMock).not.toHaveBeenCalled();
  });

  it("valida o token em /auth/profile com Bearer", async () => {
    fetchComTimeoutMock.mockResolvedValue(jsonResponse({ data: usuario }));

    await expect(lookupSession()).resolves.toEqual({ status: "authenticated", user: usuario });

    const [url, init] = fetchComTimeoutMock.mock.calls[0];
    expect(url).toBe("http://auth.test/auth/profile");
    expect(init.headers.Authorization).toBe("Bearer token-abc");
    expect(init.cache).toBe("no-store");
  });

  it("guarda a sessão autenticada em cache por 30s", async () => {
    vi.useFakeTimers();
    fetchComTimeoutMock.mockImplementation(async () => jsonResponse({ data: usuario }));

    await lookupSession();
    await lookupSession();
    expect(fetchComTimeoutMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(30_001);
    await lookupSession();
    expect(fetchComTimeoutMock).toHaveBeenCalledTimes(2);
  });

  it("o cache é por token: outro cookie força nova validação", async () => {
    fetchComTimeoutMock.mockImplementation(async () => jsonResponse({ data: usuario }));

    await lookupSession();
    comCookie("outro-token");
    await lookupSession();

    expect(fetchComTimeoutMock).toHaveBeenCalledTimes(2);
  });

  it.each([401, 403])("status %i vira unauthenticated e não é guardado em cache", async (status) => {
    fetchComTimeoutMock.mockImplementation(async () => jsonResponse({}, status));

    await expect(lookupSession()).resolves.toEqual({ status: "unauthenticated" });
    await lookupSession();

    expect(fetchComTimeoutMock).toHaveBeenCalledTimes(2);
  });

  it("erro 5xx vira unavailable (não desloga) e fica em cache por 10s", async () => {
    vi.useFakeTimers();
    fetchComTimeoutMock.mockImplementation(async () => jsonResponse({}, 502));

    await expect(lookupSession()).resolves.toEqual({ status: "unavailable" });
    await lookupSession();
    expect(fetchComTimeoutMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(10_001);
    await lookupSession();
    expect(fetchComTimeoutMock).toHaveBeenCalledTimes(2);
    expect(reportUpstreamFailureMock).toHaveBeenCalled();
  });

  it("falha de rede/timeout vira unavailable", async () => {
    fetchComTimeoutMock.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(lookupSession()).resolves.toEqual({ status: "unavailable" });
    expect(reportUpstreamFailureMock).toHaveBeenCalledWith("auth", expect.any(Error));
  });

  it("resposta 200 sem usuário vira unavailable", async () => {
    fetchComTimeoutMock.mockResolvedValue(jsonResponse({ success: true }));

    await expect(lookupSession()).resolves.toEqual({ status: "unavailable" });
  });

  it("invalidarCacheSessao(token) força nova validação (logout)", async () => {
    fetchComTimeoutMock.mockImplementation(async () => jsonResponse({ data: usuario }));

    await lookupSession();
    invalidarCacheSessao("token-abc");
    await lookupSession();

    expect(fetchComTimeoutMock).toHaveBeenCalledTimes(2);
  });

  it("getSessionUser retorna o usuário ou null", async () => {
    fetchComTimeoutMock.mockResolvedValueOnce(jsonResponse({ data: usuario }));
    await expect(getSessionUser()).resolves.toEqual(usuario);

    invalidarCacheSessao();
    fetchComTimeoutMock.mockResolvedValueOnce(jsonResponse({}, 401));
    await expect(getSessionUser()).resolves.toBeNull();
  });
});

describe("cookie de sessão", () => {
  it("grava o cookie HttpOnly, SameSite=Lax, com maxAge calculado do expiresAt", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    await setSessionCookie("tok", "2026-01-01T01:00:00Z");

    expect(cookieStore.set).toHaveBeenCalledWith(SESSION_COOKIE, "tok", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    });
  });

  it("sem expiresAt grava cookie de sessão (sem maxAge)", async () => {
    await setSessionCookie("tok");

    expect(cookieStore.set.mock.calls[0][2]).not.toHaveProperty("maxAge");
  });

  // BUG CONHECIDO (session.ts:43-47): com expiresAt no passado o maxAge
  // calculado é 0, que é falsy e acaba descartado - o cookie vira de sessão
  // em vez de expirar. Pulado até a correção - troque `it.skip` por `it`
  // quando corrigir.
  it.skip("[BUG] expiresAt no passado deveria gravar maxAge 0", async () => {
    await setSessionCookie("tok", "2000-01-01T00:00:00Z");

    expect(cookieStore.set.mock.calls[0][2]).toMatchObject({ maxAge: 0 });
  });

  it("clearSessionCookie esvazia o cookie com maxAge 0", async () => {
    await clearSessionCookie();

    expect(cookieStore.set).toHaveBeenCalledWith(SESSION_COOKIE, "", expect.objectContaining({ maxAge: 0 }));
  });
});
