import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { config, proxy } from "@/proxy";
import { SESSION_COOKIE } from "@/lib/session_cookie";

vi.mock("@/lib/session", () => ({
  lookupSession: vi.fn(),
}));

import { lookupSession } from "@/lib/session";

const mockLookup = vi.mocked(lookupSession);

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
  beforeEach(() => {
    mockLookup.mockReset();
  });

  it.each(["/chat", "/biblioteca", "/quiz", "/progresso", "/config", "/conteudo", "/perfil"])(
    "rota privada %s sem sessão redireciona para /",
    async (rota) => {
      mockLookup.mockResolvedValue({ status: "unauthenticated" });
      const res = await proxy(req(rota, false));

      expect(res.status).toBe(307);
      expect(destinoDoRedirect(res)).toBe("/");
    }
  );

  it("protege também sub-rotas e descarta a query string", async () => {
    mockLookup.mockResolvedValue({ status: "unauthenticated" });
    const res = await proxy(req("/chat/abc?modulo=1", false));

    expect(destinoDoRedirect(res)).toBe("/");
  });

  it("não confunde rota com prefixo parecido (/chatbot não é /chat)", async () => {
    const res = await proxy(req("/chatbot", false));

    expect(res.headers.get("location")).toBeNull();
  });

  it("rota privada com sessão válida segue normalmente", async () => {
    mockLookup.mockResolvedValue({ status: "authenticated", user: { id: "1", email: "a@b.com", username: "test", role: "USER" } });
    const res = await proxy(req("/chat", true));

    expect(res.headers.get("location")).toBeNull();
  });

  it.each(["/", "/cadastro", "/Login"])("rota pública %s com sessão redireciona para /chat", async (rota) => {
    mockLookup.mockResolvedValue({ status: "authenticated", user: { id: "1", email: "a@b.com", username: "test", role: "USER" } });
    const res = await proxy(req(rota, true));

    expect(destinoDoRedirect(res)).toBe("/chat");
  });

  it("rota pública sem sessão segue normalmente", async () => {
    const res1 = await proxy(req("/", false));
    expect(res1.headers.get("location")).toBeNull();
    const res2 = await proxy(req("/cadastro", false));
    expect(res2.headers.get("location")).toBeNull();
  });

  it("cookie vazio não conta como sessão", async () => {
    mockLookup.mockResolvedValue({ status: "unauthenticated" });
    const res = await proxy(
      new NextRequest("http://localhost:3000/chat", { headers: { cookie: `${SESSION_COOKIE}=` } })
    );

    expect(destinoDoRedirect(res)).toBe("/");
  });

  it("auth indisponível (unavailable) NÃO desloga — deixa passar", async () => {
    mockLookup.mockResolvedValue({ status: "unavailable" });
    const res = await proxy(req("/chat", true));

    expect(res.headers.get("location")).toBeNull();
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
