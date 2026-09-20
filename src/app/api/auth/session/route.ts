import { NextResponse } from "next/server";
import { AUTH_API_URL, reportUpstreamFailure } from "@/lib/upstream";
import { clearSessionCookie, getSessionToken } from "@/lib/session";

export async function GET() {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ success: false, message: "Não autenticado." }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${AUTH_API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
  } catch (error) {
    reportUpstreamFailure("auth", error);
    return NextResponse.json(
      { success: false, message: "Serviço de autenticação indisponível." },
      { status: 503 }
    );
  }

  const data = (await res.json().catch(() => null)) as { data?: unknown } | null;

  if (!res.ok || !data?.data) {
    await clearSessionCookie();
    return NextResponse.json({ success: false, message: "Sessão inválida." }, { status: 401 });
  }

  return NextResponse.json({ user: data.data });
}
