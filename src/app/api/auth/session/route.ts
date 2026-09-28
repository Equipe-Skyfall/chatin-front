import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionToken, invalidarCacheSessao, lookupSession } from "@/lib/session";

export async function GET() {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ success: false, message: "Não autenticado." }, { status: 401 });
  }

  const sessao = await lookupSession();

  if (sessao.status === "unauthenticated") {
    invalidarCacheSessao(token);
    await clearSessionCookie();
    return NextResponse.json({ success: false, message: "Sessão expirada." }, { status: 401 });
  }

  if (sessao.status === "unavailable") {
    return NextResponse.json(
      { success: false, message: "Serviço de autenticação indisponível." },
      { status: 503 }
    );
  }

  return NextResponse.json({ user: sessao.user });
}
