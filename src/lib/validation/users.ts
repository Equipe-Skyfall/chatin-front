import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3, "O usuário deve ter no mínimo 3 caracteres"),
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  role: z.enum(["USER", "ADMIN"], { error: "Selecione uma função" }),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object({
  username: z.string().min(3, "O usuário deve ter no mínimo 3 caracteres"),
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
});

export type EditUserFormData = z.infer<typeof editUserSchema>;

