import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session_cookie";

vi.mock("@/lib/upstream", () => ({
  AUTH_API_URL: "http://fake-auth",
  fetchComTimeout: vi.fn(),
}));

const { fetchComTimeout } = await import("@/lib/upstream");
const { config, proxy } = await import("@/proxy");

function req(path: string, comSessao: boolean) {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: comSessao ? { cookie: `${SESSION_COOKIE}=token-abc` } : {},
  });
}

function destinoDoRedirect(res: Response): string | null {
  const location = res.headers.get("location");
  return location ? new URL(location).pathname + new URL(location).search : null;
}

function mockarSessao(valida: boolean) {
  vi.mocked(fetchComTimeout).mockResolvedValue(
    new Response(null, { status: valida ? 200 : 401 })
  );
}

describe("proxy.ts (proteção de rotas no Next)", () => {
  beforeEach(() => {
    vi.mocked(fetchComTimeout).mockReset();
  });

  it.each(["/chat", "/biblioteca", "/quiz", "/progresso", "/config", "/conteudo", "/perfil"])(
    "rota privada %s sem sessão redireciona para /",
    async (rota) => {
      const res = await proxy(req(rota, false));

      expect(res.status).toBe(307);
      expect(destinoDoRedirect(res)).toBe("/");
    }
  );

  it("rota privada com cookie inválido/expirado redireciona para / e limpa o cookie", async () => {
    mockarSessao(false);

    const res = await proxy(req("/chat", true));

    expect(destinoDoRedirect(res)).toBe("/");
    expect(res.cookies.get(SESSION_COOKIE)?.value).toBeFalsy();
  });

  it("protege também sub-rotas e descarta a query string", async () => {
    const res = await proxy(req("/chat/abc?modulo=1", false));

    expect(destinoDoRedirect(res)).toBe("/");
  });

  it("não confunde rota com prefixo parecido (/chatbot não é /chat)", async () => {
    const res = await proxy(req("/chatbot", false));

    expect(res.headers.get("location")).toBeNull();
  });

  it("rota privada com sessão válida segue normalmente", async () => {
    mockarSessao(true);

    const res = await proxy(req("/chat", true));

    expect(res.headers.get("location")).toBeNull();
  });

  it.each(["/", "/cadastro", "/Login"])("rota pública %s com sessão válida redireciona para /chat", async (rota) => {
    mockarSessao(true);

    const res = await proxy(req(rota, true));

    expect(destinoDoRedirect(res)).toBe("/chat");
  });

  it("rota pública com cookie inválido/expirado NÃO redireciona e limpa o cookie", async () => {
    mockarSessao(false);

    const res = await proxy(req("/Login", true));

    expect(res.headers.get("location")).toBeNull();
    expect(res.cookies.get(SESSION_COOKIE)?.value).toBeFalsy();
  });

  it("rota pública sem sessão segue normalmente", async () => {
    expect((await proxy(req("/", false))).headers.get("location")).toBeNull();
    expect((await proxy(req("/cadastro", false))).headers.get("location")).toBeNull();
  });

  it("cookie vazio não conta como sessão", async () => {
    const res = await proxy(
      new NextRequest("http://localhost:3000/chat", { headers: { cookie: `${SESSION_COOKIE}=` } })
    );

    expect(destinoDoRedirect(res)).toBe("/");
  });

  describe("matcher", () => {
    const matcher = new RegExp(`^${config.matcher[0]}$`);

    it("roda nas páginas", () => {
      expect(matcher.test("/chat")).toBe(true);
      expect(matcher.test("/")).toBe(true);
    });

    it("não roda em /api, assets do Next nem arquivos estáticos", () => {
      expect(matcher.test("/api/study/chat")).toBe(false);
      expect(matcher.test("/_next/static/chunk.js")).toBe(false);
      expect(matcher.test("/CHATin-LOGO.png")).toBe(false);
      expect(matcher.test("/favicon.ico")).toBe(false);
    });
  });
});