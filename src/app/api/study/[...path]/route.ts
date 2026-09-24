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
  "xp",
  "resumos",
  "progresso",
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

  const upstreamUrl = `${STUDY_API_URL}/${target}${search}`;
  const iniciadoEm = Date.now();

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
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
    console.error(`[proxy:study] ${method} ${upstreamUrl} falhou após ${Date.now() - iniciadoEm}ms`);
    reportUpstreamFailure("study", error);
    return NextResponse.json({ message: "Serviço indisponível." }, { status: 503 });
  }

  console.log(`[proxy:study] ${method} ${upstreamUrl} -> ${upstream.status} em ${Date.now() - iniciadoEm}ms`);

  const contentType = upstream.headers.get("content-type") || "application/json";

  // Binary payloads (e.g. a study-summary PDF) must be forwarded as bytes -
  // `text()` would corrupt them. Everything else stays JSON/text.
  if (contentType.includes("application/pdf")) {
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": upstream.headers.get("content-disposition") || "inline",
      },
    });
  }

  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": contentType,
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

export const maxDuration = 300;
