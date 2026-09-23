import { NextResponse, type NextRequest } from "next/server";
import { AUTH_API_URL, reportUpstreamFailure } from "@/lib/upstream";
import { getSessionToken, lookupSession } from "@/lib/session";
import { createUserSchema } from "@/lib/validation/users";

async function autorizarAdmin(): Promise<{ token: string } | { erro: NextResponse }> {
  const sessao = await lookupSession();

  if (sessao.status === "unauthenticated") {
    return { erro: NextResponse.json({ success: false, message: "Não autenticado." }, { status: 401 }) };
  }

  if (sessao.status === "unavailable") {
    return {
      erro: NextResponse.json(
        { success: false, message: "Serviço de autenticação indisponível." },
        { status: 503 }
      ),
    };
  }

  if (sessao.user.role !== "ADMIN") {
    return { erro: NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 }) };
  }

  const token = await getSessionToken();

  if (!token) {
    return { erro: NextResponse.json({ success: false, message: "Não autenticado." }, { status: 401 }) };
  }

  return { token };
}

export async function GET(request: NextRequest) {
  const autorizacao = await autorizarAdmin();
  if ("erro" in autorizacao) return autorizacao.erro;

  const query = request.nextUrl.search;

  let res: Response;
  try {
    res = await fetch(`${AUTH_API_URL}/users${query}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${autorizacao.token}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    reportUpstreamFailure("auth", error);
    return NextResponse.json(
      { success: false, message: "Serviço de autenticação indisponível." },
      { status: 503 }
    );
  }

  const data = (await res.json().catch(() => null)) as { message?: string } | null;

  if (!res.ok) {
    return NextResponse.json(
      { success: false, message: data?.message || "Não foi possível carregar os usuários." },
      { status: res.status }
    );
  }

  return NextResponse.json(data ?? { success: true, data: [] });
}

export async function POST(request: NextRequest) {
  const autorizacao = await autorizarAdmin();
  if ("erro" in autorizacao) return autorizacao.erro;

  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 422 }
    );
  }

  let res: Response;
  try {
    res = await fetch(`${AUTH_API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${autorizacao.token}`,
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (error) {
    reportUpstreamFailure("auth", error);
    return NextResponse.json(
      { success: false, message: "Serviço de autenticação indisponível." },
      { status: 503 }
    );
  }

  const data = (await res.json().catch(() => null)) as { message?: string } | null;

  if (!res.ok) {
    return NextResponse.json(
      { success: false, message: data?.message || "Não foi possível criar o usuário." },
      { status: res.status }
    );
  }

  return NextResponse.json(data ?? { success: true });
}