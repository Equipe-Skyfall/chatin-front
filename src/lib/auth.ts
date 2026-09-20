import request, { ApiError } from "./api";

export type UserRole = "USER" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

export interface UserProfile extends SessionUser {
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

interface LoginResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registrar(payload: RegisterPayload): Promise<User> {
  const res = await request<RegisterResponse>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function logout(): Promise<void> {
  try {
    await request("/logout", { method: "POST" });
  } catch {
    // a sessão local é encerrada mesmo se o serviço de auth estiver indisponível
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const res = await request<{ user: SessionUser }>("/session");
    return res.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function getPerfil(userId: string): Promise<UserProfile> {
  const res = await request<ProfileResponse>(`/users/${userId}`);
  return res.data;
}

export async function atualizarPerfil(
  userId: string,
  payload: { username: string; email: string }
): Promise<UserProfile> {
  const res = await request<ProfileResponse>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}
