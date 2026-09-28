import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session_cookie";
import { lookupSession } from "@/lib/session";

const PRIVATE_ROUTES = ["/chat", "/biblioteca", "/quiz", "/progresso", "/config", "/conteudo", "/perfil"];
const PUBLIC_ONLY_ROUTES = ["/", "/cadastro", "/Login"];

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

  // Só valida se tem cookie — sem cookie, tratamos como unauthenticated.
  const session = token ? await lookupSession() : { status: "unauthenticated" as const };

  if (rotaPrivada && session.status === "unauthenticated") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  // Em unavailable (auth service fora), deixamos passar — não deslogamos
  // o usuário por instabilidade do upstream. A sessão será reavaliada
  // quando o auth service voltar (cache TTL 10s).
  if (PUBLIC_ONLY_ROUTES.includes(pathname) && token && session.status !== "unavailable") {
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
