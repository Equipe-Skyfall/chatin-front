import { NextResponse, type NextRequest } from "next/server";
import { STUDY_API_URL, reportUpstreamFailure } from "@/lib/upstream";
import { getSessionToken } from "@/lib/session";

const ALLOWED_PREFIXES = [
  "chat",
  "admin/chat",
  "trilha",
  "materias",
  "temas",
  "modulos",
  "tentativas",
];

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = (path ?? []).join("/");

  if (!isAllowedPath(target)) {
    return NextResponse.json({ message: "Recurso não permitido." }, { status: 403 });
  }

  const method = request.method.toUpperCase();

  if (!SAFE_METHODS.includes(method) && !isSameOrigin(request)) {
    return NextResponse.json({ message: "Origem não permitida." }, { status: 403 });
  }

  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const search = new URL(request.url).search;
  const body = SAFE_METHODS.includes(method) ? undefined : await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(`${STUDY_API_URL}/${target}${search}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body || undefined,
      cache: "no-store",
    });
  } catch (error) {
    reportUpstreamFailure("study", error);
    return NextResponse.json({ message: "Serviço indisponível." }, { status: 503 });
  }

  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

export const maxDuration = 60;
