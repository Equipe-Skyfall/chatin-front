import request from "./chatinApi";
import {
  ConversaOut,
  conversaOutSchema,
  MensagemOut,
  mensagemOutSchema,
  ChatRespostaOut,
  chatRespostaOutSchema,
} from "@/schemas/chat";
import { z } from "zod";

export async function listarConversas(): Promise<ConversaOut[]> {
  const data = await request<unknown>("/chat");
  return z.array(conversaOutSchema).parse(data);
}

export async function obterHistorico(conversaId: string): Promise<MensagemOut[]> {
  const data = await request<unknown>(`/chat/${conversaId}`);
  return z.array(mensagemOutSchema).parse(data);
}

export async function enviarMensagem(
  texto: string,
  contexto: { conversaId?: string; moduloId?: string }
): Promise<ChatRespostaOut> {
  const data = await request<unknown>("/chat", {
    method: "POST",
    body: JSON.stringify({
      texto,
      conversa_id: contexto.conversaId ?? null,
      modulo_id: contexto.moduloId ?? null,
    }),
  });
  return chatRespostaOutSchema.parse(data);
}
