import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation/auth";
import { AUTH_API_URL, reportUpstreamFailure } from "@/lib/upstream";

interface RegisterUpstream {
  success?: boolean;
  message?: string;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 422 }
    );
  }

  let res: Response;
  try {
    res = await fetch(`${AUTH_API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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

  const data = (await res.json().catch(() => null)) as RegisterUpstream | null;

  if (!res.ok) {
    return NextResponse.json(
      { success: false, message: data?.message || "Não foi possível criar a conta." },
      { status: res.status }
    );
  }

  return NextResponse.json(data ?? { success: true });
}
