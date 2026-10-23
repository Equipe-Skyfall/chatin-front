import { z } from "zod";

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "O usuário deve ter no mínimo 3 caracteres")
    .regex(/^[A-Za-z0-9]+$/, "Não são permitidos caracteres especiais no nome de usuário"),
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;    