import { studyRequest } from "./api";
import type {
  ChatResposta,
  Conversa,
  EnviarMensagemInput,
  Mensagem,
  Trilha,
} from "@/interfaces/chat_interfaces";

function baseChat(admin: boolean): string {
  return admin ? "/admin/chat" : "/chat";
}

export function listarConversas(admin = false): Promise<Conversa[]> {
  return studyRequest<Conversa[]>(baseChat(admin));
}

export function enviarMensagem(input: EnviarMensagemInput, admin = false): Promise<ChatResposta> {
  const corpo = admin ? { texto: input.texto, conversa_id: input.conversa_id } : input;

  return studyRequest<ChatResposta>(baseChat(admin), {
    method: "POST",
    body: JSON.stringify(corpo),
  });
}

export function obterHistorico(conversaId: string, admin = false): Promise<Mensagem[]> {
  return studyRequest<Mensagem[]>(`${baseChat(admin)}/${conversaId}`);
}

export function obterTrilha(): Promise<Trilha> {
  return studyRequest<Trilha>("/trilha");
}
