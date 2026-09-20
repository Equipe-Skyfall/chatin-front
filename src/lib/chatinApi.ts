import { getToken } from "./auth";
import { ApiError } from "./api";

const CHATIN_API_URL = process.env.NEXT_PUBLIC_CHATIN_API_URL || "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${CHATIN_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.detail || "Erro na requisição ao chatin-back", res.status);
  }

  return data as T;
}

export default request;
