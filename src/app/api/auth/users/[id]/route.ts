import { NextResponse, type NextRequest } from "next/server";
import { AUTH_API_URL, fetchComTimeout, reportUpstreamFailure } from "@/lib/upstream";
import { getSessionToken, lookupSession } from "@/lib/session";
import { profileSchema } from "@/lib/validation/profile";

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

  if (sessao.user.id !== id && sessao.user.role !== "ADMIN") {
    return { erro: NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 }) };
  }

  const token = await getSessionToken();

  if (!token) {
    return { erro: NextResponse.json({ success: false, message: "Não autenticado." }, { status: 401 }) };
  }

  return { token };
}

async function encaminhar(
  id: string,
  method: "GET" | "PUT",
  token: string,
  body?: string
): Promise<NextResponse> {
  let res: Response;
  try {
    res = await fetchComTimeout(`${AUTH_API_URL}/users/${id}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
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
      { success: false, message: data?.message || "Não foi possível concluir a operação." },
      { status: res.status }
    );
  }

  return NextResponse.json(data ?? { success: true });
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const autorizacao = await autorizar(id);

  if ("erro" in autorizacao) return autorizacao.erro;

  return encaminhar(id, "GET", autorizacao.token);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const autorizacao = await autorizar(id);

  if ("erro" in autorizacao) return autorizacao.erro;

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 422 }
    );
  }

  return encaminhar(id, "PUT", autorizacao.token, JSON.stringify(parsed.data));
}
