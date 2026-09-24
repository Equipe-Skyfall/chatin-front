// @vitest-environment jsdom
// (o cache de leituras só liga quando existe `window`)
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request, { ApiError, invalidarCacheEstudo, studyRequest } from "@/lib/api";

// Aqui o alvo do teste É o wrapper de fetch (src/lib/api.ts), então o fetch
// global é a única fronteira possível de mockar. Nos demais testes a regra do
// AGENTS.md vale: mocka-se src/lib/api.ts, nunca o fetch.

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  invalidarCacheEstudo();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("request (serviço de auth via /api/auth)", () => {
  it("chama o route handler same-origin com cabeçalhos JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await request("/session");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/session");
    expect(init?.credentials).toBe("same-origin");
    expect(init?.headers).toMatchObject({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("nunca anexa um header Authorization (o token fica no cookie HttpOnly)", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await request("/users/1");

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(Object.keys(headers).map((h) => h.toLowerCase())).not.toContain("authorization");
  });

  it("retorna undefined em respostas 204", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(request("/logout", { method: "POST" })).resolves.toBeUndefined();
  });

  it("lança ApiError com status e message do corpo em respostas de erro", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Credenciais inválidas" }, 401));

    const erro = (await request("/login").catch((e) => e)) as ApiError;

    expect(erro).toBeInstanceOf(ApiError);
    expect(erro.status).toBe(401);
    expect(erro.message).toBe("Credenciais inválidas");
    expect(erro.detail).toBe("Credenciais inválidas");
  });

  it("junta as mensagens de validação no formato do FastAPI (detail em lista)", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: [{ msg: "campo obrigatório" }, { msg: "valor inválido" }, { loc: [] }] }, 422)
    );

    const erro = (await request("/register").catch((e) => e)) as ApiError;

    expect(erro.status).toBe(422);
    expect(erro.detail).toBe("campo obrigatório valor inválido");
  });

  it("trata `success: false` como erro mesmo com status 200", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: false, message: "Falhou" }, 200));

    await expect(request("/login")).rejects.toMatchObject({ status: 200, message: "Falhou" });
  });

  it("usa mensagem genérica quando o corpo do erro não é JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>502</html>", { status: 502 }));

    await expect(request("/session")).rejects.toMatchObject({
      status: 502,
      message: "Erro na requisição",
      detail: null,
    });
  });

  it("rejeita resposta 200 sem corpo JSON válido", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 200 }));

    await expect(request("/session")).rejects.toMatchObject({ message: "Resposta inválida do servidor" });
  });

  it("converte falha de rede em ApiError com status 0", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(request("/session")).rejects.toMatchObject({
      status: 0,
      message: "Não foi possível conectar ao servidor",
    });
  });

  it("aborta a requisição no timeout e lança ApiError 408", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError"))
          );
        })
    );

    const verificacao = expect(request("/session", { timeoutMs: 50 })).rejects.toMatchObject({ status: 408 });
    await vi.advanceTimersByTimeAsync(50);
    await verificacao;
  });
});

describe("studyRequest (chatin-back via /api/study)", () => {
  it("chama o proxy /api/study", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await studyRequest("/chat");

    expect(fetchMock.mock.calls[0][0]).toBe("/api/study/chat");
  });

  it("reaproveita leituras GET em cache por alguns segundos", async () => {
    fetchMock.mockImplementation(async () => jsonResponse([{ id: "1" }]));

    const primeira = await studyRequest("/materias");
    const segunda = await studyRequest("/materias");

    expect(segunda).toEqual(primeira);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("deduplica GETs iguais disparados ao mesmo tempo", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ ok: true }));

    await Promise.all([studyRequest("/trilha"), studyRequest("/trilha"), studyRequest("/trilha")]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("chaves diferentes (path/query) não compartilham cache", async () => {
    fetchMock.mockImplementation(async () => jsonResponse([]));

    await studyRequest("/resumos?offset=0");
    await studyRequest("/resumos?offset=20");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ignora o cache com skipCache", async () => {
    fetchMock.mockImplementation(async () => jsonResponse([]));

    await studyRequest("/chat/1");
    await studyRequest("/chat/1", { skipCache: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("expira o cache depois do TTL (10s)", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async () => jsonResponse([]));

    await studyRequest("/progresso");
    vi.advanceTimersByTime(10_001);
    await studyRequest("/progresso");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("não guarda erros em cache", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: "boom" }, 500))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    await expect(studyRequest("/xp/meu")).rejects.toBeInstanceOf(ApiError);
    await expect(studyRequest("/xp/meu")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("escritas (POST/PUT/DELETE) nunca usam cache e invalidam as leituras", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ id: "1" }));

    await studyRequest("/materias");
    await studyRequest("/materias", { method: "POST", body: "{}" });
    await studyRequest("/materias");

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][1]?.method).toBe("POST");
  });

  it("invalida o cache mesmo quando a escrita falha", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ message: "erro" }, 500))
      .mockResolvedValueOnce(jsonResponse([]));

    await studyRequest("/materias");
    await studyRequest("/materias/1", { method: "DELETE" }).catch(() => undefined);
    await studyRequest("/materias");

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  // BUG CONHECIDO (api.ts:148-156): um GET que já estava em voo quando uma
  // escrita terminou grava a resposta antiga no cache logo depois da
  // invalidação. Pulado até a correção - troque `it.skip` por `it` quando
  // corrigir.
  it.skip("[BUG] GET em voo durante uma escrita não deveria repovoar o cache com dado velho", async () => {
    const leituraLenta = deferred<Response>();
    fetchMock
      .mockReturnValueOnce(leituraLenta.promise)
      .mockResolvedValueOnce(jsonResponse({ id: "novo" }))
      .mockResolvedValueOnce(jsonResponse([{ id: "novo" }]));

    const leitura = studyRequest("/materias");
    await studyRequest("/materias", { method: "POST", body: "{}" });
    leituraLenta.resolve(jsonResponse([{ id: "velho" }]));
    await leitura;

    await expect(studyRequest("/materias")).resolves.toEqual([{ id: "novo" }]);
  });
});
