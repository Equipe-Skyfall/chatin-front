import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session_cookie";
import { AUTH_API_URL, fetchComTimeout } from "@/lib/upstream";

const PRIVATE_ROUTES = ["/chat", "/biblioteca", "/quiz", "/progresso", "/config", "/conteudo", "/perfil"];
const PUBLIC_ONLY_ROUTES = ["/", "/cadastro", "/Login"];

async function sessaoValida(token: string): Promise<boolean> {
  try {
    const res = await fetchComTimeout(`${AUTH_API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    // CORREÇÃO: Se der erro na requisição (ex: backend reiniciando), a sessão NÃO é válida.
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value || null;

  const rotaPrivada = PRIVATE_ROUTES.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );
  const rotaPublicaSomente = PUBLIC_ONLY_ROUTES.includes(pathname);

  if (!rotaPrivada && !rotaPublicaSomente) {
    return NextResponse.next();
  }

  const temSessaoValida = token ? await sessaoValida(token) : false;

  if (rotaPrivada && !temSessaoValida) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  if (rotaPublicaSomente && temSessaoValida) {
    const url = request.nextUrl.clone();
    url.pathname = "/chat";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (rotaPublicaSomente && token && !temSessaoValida) {
    const res = NextResponse.next();
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};