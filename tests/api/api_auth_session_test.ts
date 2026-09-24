import { beforeEach, describe, expect, it, vi } from "vitest";

const sessao = vi.hoisted(() => ({
  getSessionToken: vi.fn(),
  lookupSession: vi.fn(),
  clearSessionCookie: vi.fn(),
  invalidarCacheSessao: vi.fn(),
}));

vi.mock("@/lib/session", () => sessao);

import { GET } from "@/app/api/auth/session/route";

const usuario = { id: "u1", email: "ana@chatin.com", username: "ana", role: "USER" };

beforeEach(() => {
  sessao.getSessionToken.mockResolvedValue("token-abc");
});

describe("GET /api/auth/session", () => {
  it("retorna 401 sem cookie", async () => {
    sessao.getSessionToken.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
    expect(sessao.lookupSession).not.toHaveBeenCalled();
  });

  it("devolve o usuário quando a sessão é válida", async () => {
    sessao.lookupSession.mockResolvedValue({ status: "authenticated", user: usuario });

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ user: usuario });
  });

  it("sessão expirada: limpa o cookie, o cache e retorna 401", async () => {
    sessao.lookupSession.mockResolvedValue({ status: "unauthenticated" });

    const res = await GET();

    expect(res.status).toBe(401);
    expect(sessao.invalidarCacheSessao).toHaveBeenCalledWith("token-abc");
    expect(sessao.clearSessionCookie).toHaveBeenCalled();
  });

  it("serviço de auth fora do ar: 503 e mantém o cookie (não desloga o usuário)", async () => {
    sessao.lookupSession.mockResolvedValue({ status: "unavailable" });

    const res = await GET();

    expect(res.status).toBe(503);
    expect(sessao.clearSessionCookie).not.toHaveBeenCalled();
  });
});
