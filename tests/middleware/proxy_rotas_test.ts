import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { config, proxy } from "@/proxy";
import { SESSION_COOKIE } from "@/lib/session_cookie";

function req(path: string, comSessao: boolean) {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: comSessao ? { cookie: `${SESSION_COOKIE}=token-abc` } : {},
  });
}

function destinoDoRedirect(res: Response): string | null {
  const location = res.headers.get("location");
  return location ? new URL(location).pathname + new URL(location).search : null;
}

describe("proxy.ts (proteção de rotas no Next)", () => {
  it.each(["/chat", "/biblioteca", "/quiz", "/progresso", "/config", "/conteudo", "/perfil"])(
    "rota privada %s sem sessão redireciona para /",
    (rota) => {
      const res = proxy(req(rota, false));

      expect(res.status).toBe(307);
      expect(destinoDoRedirect(res)).toBe("/");
    }
  );

  it("protege também sub-rotas e descarta a query string", () => {
    const res = proxy(req("/chat/abc?modulo=1", false));

    expect(destinoDoRedirect(res)).toBe("/");
  });

  it("não confunde rota com prefixo parecido (/chatbot não é /chat)", () => {
    const res = proxy(req("/chatbot", false));

    expect(res.headers.get("location")).toBeNull();
  });

  it("rota privada com sessão segue normalmente", () => {
    const res = proxy(req("/chat", true));

    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it.each(["/", "/cadastro", "/Login"])("rota pública %s com sessão redireciona para /chat", (rota) => {
    const res = proxy(req(rota, true));

    expect(destinoDoRedirect(res)).toBe("/chat");
  });

  it("rota pública sem sessão segue normalmente", () => {
    expect(proxy(req("/", false)).headers.get("location")).toBeNull();
    expect(proxy(req("/cadastro", false)).headers.get("location")).toBeNull();
  });

  it("cookie vazio não conta como sessão", () => {
    const res = proxy(
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
