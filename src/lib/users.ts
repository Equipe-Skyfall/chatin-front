import request from "./api";
import type { User, UserRole } from "./auth";

export interface AdminUser extends User {
  role: UserRole;
}

interface UsersListResponse {
  success: boolean;
  message: string;
  data: AdminUser[];
}

interface UserResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  username: string;
  email: string;
}

export async function getAllUsers(params?: { skip?: number; take?: number }): Promise<AdminUser[]> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.take !== undefined) query.set("take", String(params.take));

  const queryString = query.toString();
  const res = await request<UsersListResponse>(`/users${queryString ? `?${queryString}` : ""}`);
  return res.data;
}

export async function criarUsuario(payload: CreateUserPayload): Promise<AdminUser> {
  const res = await request<UserResponse>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function atualizarUsuario(userId: string, payload: UpdateUserPayload): Promise<AdminUser> {
  const res = await request<UserResponse>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function excluirUsuario(userId: string): Promise<void> {
  await request<void>(`/users/${userId}`, { method: "DELETE" });
}