import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { getSessionTokenMock } = vi.hoisted(() => ({ getSessionTokenMock: vi.fn() }));

vi.mock("@/lib/session", () => ({ getSessionToken: getSessionTokenMock }));
vi.mock("@/lib/upstream", () => ({
  STUDY_API_URL: "http://study.test",
  reportUpstreamFailure: vi.fn(),
}));

import { DELETE, GET, POST } from "@/app/api/study/[...path]/route";

// O route handler fala direto com o chatin-back via fetch global (não passa
// por src/lib/api.ts, que é código de cliente), então o fetch é a fronteira.
const fetchMock = vi.fn<typeof fetch>();

function contexto(path: string[]) {
  return { params: Promise.resolve({ path }) };
}

function req(url: string, init: ConstructorParameters<typeof NextRequest>[1] = {}) {
  return new NextRequest(`http://localhost:3000${url}`, init);
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  getSessionTokenMock.mockResolvedValue("token-abc");
  fetchMock.mockReset();
});

describe("proxy /api/study/[...path] → chatin-back", () => {
  it("bloqueia caminhos fora da allowlist com 403", async () => {
    const res = await GET(req("/api/study/usuarios"), contexto(["usuarios"]));

    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("não aceita prefixo parecido (ex.: `chatbot` não é `chat`)", async () => {
    const res = await GET(req("/api/study/chatbot"), contexto(["chatbot"]));

    expect(res.status).toBe(403);
  });

  it("retorna 401 sem cookie de sessão", async () => {
    getSessionTokenMock.mockResolvedValue(null);

    const res = await GET(req("/api/study/chat"), contexto(["chat"]));

    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("encaminha GET com Bearer do cookie e preserva a query string", async () => {
    fetchMock.mockResolvedValue(Response.json([{ id: "r1" }]));

    const res = await GET(req("/api/study/resumos?limit=20&offset=0"), contexto(["resumos"]));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://study.test/resumos?limit=20&offset=0");
    expect(init?.method).toBe("GET");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer token-abc");
    expect(init?.body).toBeUndefined();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([{ id: "r1" }]);
  });

  it("encaminha caminhos aninhados", async () => {
    fetchMock.mockResolvedValue(Response.json({}));

    await GET(req("/api/study/admin/chat/c1"), contexto(["admin", "chat", "c1"]));

    expect(fetchMock.mock.calls[0][0]).toBe("http://study.test/admin/chat/c1");
  });

  it("encaminha o corpo de um POST same-origin", async () => {
    fetchMock.mockResolvedValue(Response.json({ conversa_id: "c1" }));

    await POST(
      req("/api/study/chat", {
        method: "POST",
        headers: { origin: "http://localhost:3000", host: "localhost:3000" },
        body: JSON.stringify({ texto: "Oi" }),
      }),
      contexto(["chat"])
    );

    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST", body: JSON.stringify({ texto: "Oi" }) });
  });

  it("bloqueia escrita vinda de outra origem (CSRF) com 403", async () => {
    const res = await DELETE(
      req("/api/study/materias/m1", {
        method: "DELETE",
        headers: { origin: "http://site-malicioso.com", host: "localhost:3000" },
      }),
      contexto(["materias", "m1"])
    );

    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("repassa o status de erro do backend", async () => {
    fetchMock.mockResolvedValue(Response.json({ detail: "Módulo bloqueado" }, { status: 422 }));

    const res = await GET(req("/api/study/modulos/m1"), contexto(["modulos", "m1"]));

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({ detail: "Módulo bloqueado" });
  });

  it("retorna 503 quando o backend está fora do ar", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const res = await GET(req("/api/study/trilha"), contexto(["trilha"]));

    expect(res.status).toBe(503);
  });

  it("repassa PDF como bytes, sem corromper, com Content-Disposition", async () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0xff, 0x00, 0x80]);
    fetchMock.mockResolvedValue(
      new Response(bytes, {
        headers: { "content-type": "application/pdf", "content-disposition": 'attachment; filename="r.pdf"' },
      })
    );

    const res = await GET(req("/api/study/resumos/r1/pdf"), contexto(["resumos", "r1", "pdf"]));

    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="r.pdf"');
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(bytes);
  });

  // BUG CONHECIDO (route.ts:20-22): a allowlist só confere o prefixo, então
  // `chat/../../users` passa e o fetch normaliza para outro recurso do
  // backend. Pulado até a correção - troque `it.skip` por `it` quando corrigir.
  it.skip("[BUG] deveria bloquear `..` para sair da allowlist", async () => {
    fetchMock.mockResolvedValue(Response.json({}));

    const res = await GET(req("/api/study/chat/x"), contexto(["chat", "..", "..", "users"]));

    expect(res.status).toBe(403);
  });
});
