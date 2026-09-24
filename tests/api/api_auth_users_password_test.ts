import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { fetchComTimeoutMock, sessao } = vi.hoisted(() => ({
  fetchComTimeoutMock: vi.fn(),
  sessao: { lookupSession: vi.fn(), getSessionToken: vi.fn() },
}));

vi.mock("@/lib/upstream", () => ({
  AUTH_API_URL: "http://auth.test",
  fetchComTimeout: fetchComTimeoutMock,
  reportUpstreamFailure: vi.fn(),
}));
vi.mock("@/lib/session", () => sessao);

import { PATCH } from "@/app/api/auth/users/[id]/password/route";

const aluno = { id: "u1", email: "ana@chatin.com", username: "ana", role: "USER" };
const admin = { id: "adm", email: "adm@chatin.com", username: "adm", role: "ADMIN" };
const troca = { currentPassword: "atual123", newPassword: "novaSenha1" };

function req(id: string, body: unknown) {
  return new NextRequest(`http://localhost:3000/api/auth/users/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

const contexto = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  fetchComTimeoutMock.mockReset();
  fetchComTimeoutMock.mockResolvedValue(new Response(null, { status: 204 }));
  sessao.getSessionToken.mockResolvedValue("token-abc");
  sessao.lookupSession.mockResolvedValue({ status: "authenticated", user: aluno });
});

describe("PATCH /api/auth/users/[id]/password (troca de senha)", () => {
  it("retorna 401 sem sessão", async () => {
    sessao.lookupSession.mockResolvedValue({ status: "unauthenticated" });

    const res = await PATCH(req("u1", troca), contexto("u1"));

    expect(res.status).toBe(401);
  });

  it("aluno troca a própria senha e o 204 é repassado", async () => {
    const res = await PATCH(req("u1", troca), contexto("u1"));

    expect(res.status).toBe(204);
    const [url, init] = fetchComTimeoutMock.mock.calls[0];
    expect(url).toBe("http://auth.test/users/u1/password");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual(troca);
  });

  it("aluno NÃO troca a senha de outro usuário - 403", async () => {
    const res = await PATCH(req("outro", troca), contexto("outro"));

    expect(res.status).toBe(403);
    expect(fetchComTimeoutMock).not.toHaveBeenCalled();
  });

  it("nem o admin troca a senha de outro usuário por aqui - 403", async () => {
    sessao.lookupSession.mockResolvedValue({ status: "authenticated", user: admin });

    const res = await PATCH(req("u1", troca), contexto("u1"));

    expect(res.status).toBe(403);
  });

  it("rejeita nova senha curta com 422", async () => {
    const res = await PATCH(req("u1", { ...troca, newPassword: "123" }), contexto("u1"));

    expect(res.status).toBe(422);
    expect(fetchComTimeoutMock).not.toHaveBeenCalled();
  });

  it("repassa erro de senha atual incorreta", async () => {
    fetchComTimeoutMock.mockResolvedValue(Response.json({ message: "Senha atual incorreta" }, { status: 400 }));

    const res = await PATCH(req("u1", troca), contexto("u1"));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ message: "Senha atual incorreta" });
  });

  it("retorna 503 quando o serviço de auth está indisponível", async () => {
    fetchComTimeoutMock.mockRejectedValue(new Error("timeout"));

    const res = await PATCH(req("u1", troca), contexto("u1"));

    expect(res.status).toBe(503);
  });
});
