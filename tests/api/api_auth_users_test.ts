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

import { GET, PUT } from "@/app/api/auth/users/[id]/route";

const aluno = { id: "u1", email: "ana@chatin.com", username: "ana", role: "USER" };
const admin = { id: "adm", email: "adm@chatin.com", username: "adm", role: "ADMIN" };

function contexto(id: string) {
  return { params: Promise.resolve({ id }) };
}

function reqPut(id: string, body: unknown) {
  return new NextRequest(`http://localhost:3000/api/auth/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

const reqGet = (id: string) => new NextRequest(`http://localhost:3000/api/auth/users/${id}`);

beforeEach(() => {
  fetchComTimeoutMock.mockReset();
  fetchComTimeoutMock.mockResolvedValue(Response.json({ success: true, data: aluno }));
  sessao.getSessionToken.mockResolvedValue("token-abc");
  sessao.lookupSession.mockResolvedValue({ status: "authenticated", user: aluno });
});

describe("GET /api/auth/users/[id] (perfil)", () => {
  it("retorna 401 sem sessão", async () => {
    sessao.lookupSession.mockResolvedValue({ status: "unauthenticated" });

    const res = await GET(reqGet("u1"), contexto("u1"));

    expect(res.status).toBe(401);
    expect(fetchComTimeoutMock).not.toHaveBeenCalled();
  });

  it("retorna 503 se o serviço de auth estiver indisponível", async () => {
    sessao.lookupSession.mockResolvedValue({ status: "unavailable" });

    const res = await GET(reqGet("u1"), contexto("u1"));

    expect(res.status).toBe(503);
  });

  it("aluno lê o próprio perfil com o Bearer do cookie", async () => {
    const res = await GET(reqGet("u1"), contexto("u1"));

    expect(res.status).toBe(200);
    const [url, init] = fetchComTimeoutMock.mock.calls[0];
    expect(url).toBe("http://auth.test/users/u1");
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBe("Bearer token-abc");
  });

  it("aluno NÃO lê o perfil de outro usuário (IDOR) - 403", async () => {
    const res = await GET(reqGet("outro"), contexto("outro"));

    expect(res.status).toBe(403);
    expect(fetchComTimeoutMock).not.toHaveBeenCalled();
  });

  it("admin pode ler o perfil de outro usuário", async () => {
    sessao.lookupSession.mockResolvedValue({ status: "authenticated", user: admin });

    const res = await GET(reqGet("u1"), contexto("u1"));

    expect(res.status).toBe(200);
  });

  it("repassa erro do serviço de auth", async () => {
    fetchComTimeoutMock.mockResolvedValue(Response.json({ message: "Não encontrado" }, { status: 404 }));

    const res = await GET(reqGet("u1"), contexto("u1"));

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({ success: false, message: "Não encontrado" });
  });
});

describe("PUT /api/auth/users/[id] (edição de perfil)", () => {
  it("aluno NÃO edita o perfil de outro usuário - 403", async () => {
    const res = await PUT(reqPut("outro", { username: "hacker", email: "h@x.com" }), contexto("outro"));

    expect(res.status).toBe(403);
    expect(fetchComTimeoutMock).not.toHaveBeenCalled();
  });

  it("rejeita dados inválidos com 422", async () => {
    const res = await PUT(reqPut("u1", { username: "a", email: "ana@chatin.com" }), contexto("u1"));

    expect(res.status).toBe(422);
    expect(fetchComTimeoutMock).not.toHaveBeenCalled();
  });

  it("encaminha só username/email - não deixa o aluno se promover a ADMIN", async () => {
    await PUT(reqPut("u1", { username: "ana2", email: "ana@chatin.com", role: "ADMIN" }), contexto("u1"));

    const [, init] = fetchComTimeoutMock.mock.calls[0];
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual({ username: "ana2", email: "ana@chatin.com" });
  });

  it("retorna 503 se o fetch ao serviço de auth falhar", async () => {
    fetchComTimeoutMock.mockRejectedValue(new Error("timeout"));

    const res = await PUT(reqPut("u1", { username: "ana", email: "ana@chatin.com" }), contexto("u1"));

    expect(res.status).toBe(503);
  });
});
