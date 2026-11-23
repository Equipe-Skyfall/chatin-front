import request, { ApiError, studyRequest } from "./api";
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

/**
 * Apaga tudo o que o chatin-back guarda do usuário (XP e, com ele, o ranking,
 * progresso, streak, conversas, tentativas, resumos, perfil). O 404 do back só diz
 * que não há dados - quem nunca usou o app, ou uma nova tentativa depois de uma
 * falha no meio da exclusão - e conta como sucesso.
 */
export async function apagarDadosDoUsuario(userId: string): Promise<void> {
  try {
    await studyRequest<unknown>(`/admin/usuarios/${userId}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return;
    throw error;
  }
}

/**
 * Exclui a conta por completo: primeiro os dados no chatin-back, depois o login no
 * authservice. Nessa ordem, uma falha no meio deixa o usuário ainda na lista do
 * admin, que pode tentar de novo; na ordem inversa ele sumiria da lista e o XP dele
 * ficaria preso no ranking.
 */
export async function excluirUsuario(userId: string): Promise<void> {
  await apagarDadosDoUsuario(userId);
  await request<void>(`/users/${userId}`, { method: "DELETE" });
}