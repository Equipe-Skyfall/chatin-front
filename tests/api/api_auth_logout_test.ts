import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchComTimeoutMock, sessao } = vi.hoisted(() => ({
  fetchComTimeoutMock: vi.fn(),
  sessao: {
    getSessionToken: vi.fn(),
    clearSessionCookie: vi.fn(),
    invalidarCacheSessao: vi.fn(),
  },
}));

vi.mock("@/lib/upstream", () => ({ AUTH_API_URL: "http://auth.test", fetchComTimeout: fetchComTimeoutMock }));
vi.mock("@/lib/session", () => sessao);

import { POST } from "@/app/api/auth/logout/route";

beforeEach(() => {
  fetchComTimeoutMock.mockReset();
  fetchComTimeoutMock.mockResolvedValue(new Response(null, { status: 204 }));
});

describe("POST /api/auth/logout", () => {
  it("revoga o token no serviço de auth, esquece o cache e limpa o cookie", async () => {
    sessao.getSessionToken.mockResolvedValue("token-abc");

    const res = await POST();

    expect(res.status).toBe(200);
    expect(sessao.invalidarCacheSessao).toHaveBeenCalledWith("token-abc");
    expect(fetchComTimeoutMock).toHaveBeenCalledWith(
      "http://auth.test/auth/logout",
      expect.objectContaining({ method: "POST", headers: expect.objectContaining({ Authorization: "Bearer token-abc" }) })
    );
    expect(sessao.clearSessionCookie).toHaveBeenCalled();
  });

  it("limpa o cookie mesmo se o serviço de auth falhar", async () => {
    sessao.getSessionToken.mockResolvedValue("token-abc");
    fetchComTimeoutMock.mockRejectedValue(new Error("timeout"));

    const res = await POST();

    expect(res.status).toBe(200);
    expect(sessao.clearSessionCookie).toHaveBeenCalled();
  });

  it("sem cookie não chama o serviço de auth", async () => {
    sessao.getSessionToken.mockResolvedValue(null);

    const res = await POST();

    expect(res.status).toBe(200);
    expect(fetchComTimeoutMock).not.toHaveBeenCalled();
    expect(sessao.clearSessionCookie).toHaveBeenCalled();
  });
});
