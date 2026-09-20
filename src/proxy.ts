import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session_cookie";

const PRIVATE_ROUTES = ["/chat", "/biblioteca", "/quiz", "/progresso", "/config", "/conteudo"];
const PUBLIC_ONLY_ROUTES = ["/", "/cadastro"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const temSessao = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const rotaPrivada = PRIVATE_ROUTES.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );

  if (rotaPrivada && !temSessao) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (PUBLIC_ONLY_ROUTES.includes(pathname) && temSessao) {
    const url = request.nextUrl.clone();
    url.pathname = "/chat";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
