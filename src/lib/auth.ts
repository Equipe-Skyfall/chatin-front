import request from "./api";
import { decodeToken, JwtPayload } from "./jwt";
import {z} from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z.string().min(3, "O usuário deve ter no mínimo 3 caracteres"),
    email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export function getCurrentUser(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
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
  data: {
    token: string;
    expiresAt: string;
  };
}

const TOKEN_KEY = "skytrack_token";
const EXPIRES_KEY = "skytrack_token_expires";

export async function registrar(payload: RegisterPayload): Promise<User> {
  const res = await request<RegisterResponse>("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function login(payload: LoginPayload) {
  const res = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  localStorage.setItem(TOKEN_KEY, res.data.token);
  localStorage.setItem(EXPIRES_KEY, res.data.expiresAt);

  return res.data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(EXPIRES_KEY);

  if (!token || !expiresAt) return null;

  if (new Date(expiresAt) < new Date()) {
    logout();
    return null;
  }

  return token;
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}