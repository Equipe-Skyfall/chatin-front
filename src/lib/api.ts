
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://auth.skytrack.space";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || (data && data.success === false)) {
    throw new ApiError(data?.message || "Erro na requisição", res.status);
  }

  return data as T;
}

export default request;