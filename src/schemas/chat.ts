import { z } from "zod";

export const conversaOutSchema = z.object({
  id: z.string(),
  titulo: z.string().nullable(),
  modulo_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ConversaOut = z.infer<typeof conversaOutSchema>;

export const mensagemOutSchema = z.object({
  id: z.string(),
  papel: z.string(),
  conteudo: z.string().nullable(),
  created_at: z.string(),
});
export type MensagemOut = z.infer<typeof mensagemOutSchema>;

export const chatRespostaOutSchema = z.object({
  conversa_id: z.string(),
  resposta: z.string(),
});
export type ChatRespostaOut = z.infer<typeof chatRespostaOutSchema>;
