import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchComTimeoutMock } = vi.hoisted(() => ({ fetchComTimeoutMock: vi.fn() }));

vi.mock("@/lib/upstream", () => ({
  AUTH_API_URL: "http://auth.test",
  fetchComTimeout: fetchComTimeoutMock,
  reportUpstreamFailure: vi.fn(),
}));

import { POST } from "@/app/api/auth/register/route";

function req(body: unknown) {
  return new Request("http://localhost:3000/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const cadastro = { username: "ana", email: "ana@chatin.com", password: "senhaforte" };

beforeEach(() => {
  fetchComTimeoutMock.mockReset();
});

describe("POST /api/auth/register", () => {
  it("rejeita payload inválido com 422", async () => {
    const res = await POST(req({ ...cadastro, username: "a" }));

    expect(res.status).toBe(422);
    expect(fetchComTimeoutMock).not.toHaveBeenCalled();
  });

  it("não deixa o cliente escolher a própria role (mass assignment)", async () => {
    fetchComTimeoutMock.mockResolvedValue(Response.json({ success: true }));

    await POST(req({ ...cadastro, role: "ADMIN" }));

    const [url, init] = fetchComTimeoutMock.mock.calls[0];
    expect(url).toBe("http://auth.test/users/register");
    expect(JSON.parse(init.body)).toEqual(cadastro);
  });

  it("devolve a resposta do serviço em caso de sucesso", async () => {
    fetchComTimeoutMock.mockResolvedValue(Response.json({ success: true, data: { id: "u1" } }));

    const res = await POST(req(cadastro));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true, data: { id: "u1" } });
  });

  it("repassa conflito de e-mail já cadastrado", async () => {
    fetchComTimeoutMock.mockResolvedValue(Response.json({ message: "Email already exists" }, { status: 409 }));

    const res = await POST(req(cadastro));

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({ success: false, message: "Email already exists" });
  });

  it("retorna 503 quando o serviço de auth está indisponível", async () => {
    fetchComTimeoutMock.mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await POST(req(cadastro));

    expect(res.status).toBe(503);
  });
});
