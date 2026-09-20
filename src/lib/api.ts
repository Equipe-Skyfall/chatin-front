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

async function requestWithBase<T>(basePath: string, path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${basePath}${path}`, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || (data && (data as { success?: boolean }).success === false)) {
    const detail = extractDetail(data);
    throw new ApiError(detail || "Erro na requisição", res.status, detail);
  }

  return data as T;
}

export default function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  return requestWithBase<T>("/api/auth", path, options);
}

export function studyRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return requestWithBase<T>("/api/study", path, options);
}
