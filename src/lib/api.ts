const AUTH_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://auth.skytrack.space";
const STUDY_API_URL = process.env.NEXT_PUBLIC_STUDY_API_URL || "https://chatin-back.onrender.com";

const DEFAULT_TIMEOUT_MS = 15000;

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError("Tempo de requisição esgotado", 408);
    }
    throw new ApiError("Não foi possível conectar ao servidor", 0);
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || (data && typeof data === "object" && "success" in data && data.success === false)) {
    const detail = extractDetail(data);
    throw new ApiError(detail || "Erro na requisição", res.status, detail);
  }

  if (data === null) {
    throw new ApiError("Resposta inválida do servidor", res.status);
  }

  return data as T;
}

export default function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  return requestWithBase<T>(AUTH_API_URL, path, options);
}

export function studyRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return requestWithBase<T>(STUDY_API_URL, path, options);
}