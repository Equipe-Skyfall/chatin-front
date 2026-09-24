import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchComTimeoutMock, setSessionCookieMock } = vi.hoisted(() => ({
  fetchComTimeoutMock: vi.fn(),
  setSessionCookieMock: vi.fn(),
}));

vi.mock("@/lib/upstream", () => ({
  AUTH_API_URL: "http://auth.test",
  fetchComTimeout: fetchComTimeoutMock,
  reportUpstreamFailure: vi.fn(),
}));
vi.mock("@/lib/session", () => ({ setSessionCookie: setSessionCookieMock }));

import { POST } from "@/app/api/auth/login/route";

function req(body: unknown) {
  return new Request("http://localhost:3000/api/auth/login", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const credenciais = { email: "ana@chatin.com", password: "senhaforte" };

beforeEach(() => {
  fetchComTimeoutMock.mockReset();
});

describe("POST /api/auth/login", () => {
  it("rejeita payload inválido com 422 sem chamar o serviço de auth", async () => {
    const res = await POST(req({ email: "x", password: "123" }));

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toMatchObject({ success: false, message: "E-mail inválido" });
    expect(fetchComTimeoutMock).not.toHaveBeenCalled();
  });

  it("rejeita corpo que não é JSON com 422", async () => {
    const res = await POST(req("isso não é json"));

    expect(res.status).toBe(422);
  });

  it("encaminha só os campos validados para o serviço de auth", async () => {
    fetchComTimeoutMock.mockResolvedValue(Response.json({ data: { token: "t" } }));

    await POST(req({ ...credenciais, role: "ADMIN" }));

    const [url, init] = fetchComTimeoutMock.mock.calls[0];
    expect(url).toBe("http://auth.test/auth/login");
    expect(JSON.parse(init.body)).toEqual(credenciais);
  });

  it("em sucesso grava o cookie e NÃO devolve o token ao navegador", async () => {
    fetchComTimeoutMock.mockResolvedValue(
      Response.json({ message: "ok", data: { token: "segredo", expiresAt: "2026-12-31T00:00:00Z" } })
    );

    const res = await POST(req(credenciais));
    const corpo = await res.json();

    expect(res.status).toBe(200);
    expect(setSessionCookieMock).toHaveBeenCalledWith("segredo", "2026-12-31T00:00:00Z");
    expect(JSON.stringify(corpo)).not.toContain("segredo");
    expect(corpo).toEqual({ success: true, message: "ok", expiresAt: "2026-12-31T00:00:00Z" });
  });

  it("repassa status e mensagem de credenciais inválidas", async () => {
    fetchComTimeoutMock.mockResolvedValue(Response.json({ message: "Invalid credentials" }, { status: 401 }));

    const res = await POST(req(credenciais));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({ message: "Invalid credentials" });
    expect(setSessionCookieMock).not.toHaveBeenCalled();
  });

  it("trata 200 sem token como 401", async () => {
    fetchComTimeoutMock.mockResolvedValue(Response.json({ success: true, data: {} }));

    const res = await POST(req(credenciais));

    expect(res.status).toBe(401);
    expect(setSessionCookieMock).not.toHaveBeenCalled();
  });

  it("retorna 503 quando o serviço de auth está indisponível", async () => {
    fetchComTimeoutMock.mockRejectedValue(new Error("timeout"));

    const res = await POST(req(credenciais));

    expect(res.status).toBe(503);
  });
});
