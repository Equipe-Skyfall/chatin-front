import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { AUTH_API_URL, fetchComTimeout, reportUpstreamFailure } from "@/lib/upstream";
import { setSessionCookie } from "@/lib/session";

interface LoginUpstream {
  success?: boolean;
  message?: string;
  data?: { token?: string; expiresAt?: string };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 422 }
    );
  }

  let res: Response;
  try {
    res = await fetchComTimeout(`${AUTH_API_URL}/auth/login`, {
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

  const data = (await res.json().catch(() => null)) as LoginUpstream | null;
  const token = data?.data?.token;

  if (!res.ok || !token) {
    return NextResponse.json(
      { success: false, message: data?.message || "E-mail ou senha incorretos." },
      { status: res.ok ? 401 : res.status }
    );
  }

  await setSessionCookie(token, data?.data?.expiresAt);

  return NextResponse.json({
    success: true,
    message: data?.message || "Login realizado.",
    expiresAt: data?.data?.expiresAt,
  });
}
