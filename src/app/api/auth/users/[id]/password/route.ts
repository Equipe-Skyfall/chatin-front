import { NextResponse, type NextRequest } from "next/server";
import { AUTH_API_URL, fetchComTimeout, reportUpstreamFailure } from "@/lib/upstream";
import { getSessionToken, lookupSession } from "@/lib/session";
import { changePasswordApiSchema } from "@/lib/validation/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function autorizar(id: string): Promise<{ token: string } | { erro: NextResponse }> {
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

  // Troca de senha é uma ação sobre a própria conta — nem admin pode trocar a senha alheia por aqui.
  if (sessao.user.id !== id) {
    return { erro: NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 }) };
  }

  const token = await getSessionToken();

  if (!token) {
    return { erro: NextResponse.json({ success: false, message: "Não autenticado." }, { status: 401 }) };
  }

  return { token };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const autorizacao = await autorizar(id);

  if ("erro" in autorizacao) return autorizacao.erro;

  const body = await request.json().catch(() => null);
  const parsed = changePasswordApiSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 422 }
    );
  }

  let res: Response;
  try {
    res = await fetchComTimeout(`${AUTH_API_URL}/users/${id}/password`, {
      method: "PATCH",
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

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = (await res.json().catch(() => null)) as { message?: string } | null;

  if (!res.ok) {
    return NextResponse.json(
      { success: false, message: data?.message || "Não foi possível alterar a senha." },
      { status: res.status }
    );
  }

  return NextResponse.json(data ?? { success: true });
}