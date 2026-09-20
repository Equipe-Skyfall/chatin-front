import { getToken } from "./auth";

// Serviço de auth externo: em dev, passa pelo proxy same-origin do Next.js
// (ver next.config.ts) pra não esbarrar em CORS - o domínio direto só é
// usado se NEXT_PUBLIC_API_URL for explicitamente setado (ex. produção,
// onde o front já roda no mesmo domínio autorizado pelo serviço de auth).
const AUTH_API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/authsys";
// Backend chatin-back: default aponta pro deploy na nuvem (Render) - pra
// rodar contra o backend local, sobrescrever NEXT_PUBLIC_CHATIN_API_URL no
// .env.local (nunca commitado, só vale na sua máquina).
const CHATIN_API_URL = process.env.NEXT_PUBLIC_CHATIN_API_URL || "https://chatin-back.onrender.com";

export class ApiError extends Error {
  constructor(message: string, public status: number, public detail: string | null = null) {
    super(message);
    this.name = "ApiError";
  }
}

function extractDetail(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const { message, detail } = data as { message?: unknown; detail?: unknown };

  if (typeof message === "string" && message) return message;
  if (typeof detail === "string" && detail) return detail;

  if (Array.isArray(detail)) {
    const mensagens = detail
      .map((item) => (item && typeof item === "object" ? (item as { msg?: unknown }).msg : null))
      .filter((msg): msg is string => typeof msg === "string" && msg.length > 0);

    if (mensagens.length) return mensagens.join(" ");
  }

  return null;
}

async function requestWithBase<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || (data && data.success === false)) {
    const detail = extractDetail(data);
    throw new ApiError(detail || "Erro na requisição", res.status, detail);
  }

  return data as T;
}

/** Serviço de auth externo (login/cadastro) - nunca leva token, é quem o emite. */
export default function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  return requestWithBase<T>(AUTH_API_URL, path, options);
}

/** chatin-back - anexa o Bearer token automaticamente em toda chamada. */
export function studyRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  return requestWithBase<T>(CHATIN_API_URL, path, {
    ...options,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
}
