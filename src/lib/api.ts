import { getToken } from "./auth";

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

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export async function getPerfil(userId: string): Promise<UserProfile> {
  const token = getToken();
  const res = await request<ProfileResponse>(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function atualizarPerfil(
  userId: string,
  payload: { username: string; email: string }
): Promise<UserProfile> {
  const token = getToken();
  const res = await request<ProfileResponse>(`/users/${userId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return res.data;
}