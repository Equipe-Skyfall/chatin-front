import { studyRequest } from "./api";
import { getToken } from "./auth";
import type {
  ChatResposta,
  Conversa,
  EnviarMensagemInput,
  Mensagem,
  Trilha,
} from "@/interfaces/chat_interfaces";

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function listarConversas(): Promise<Conversa[]> {
  return studyRequest<Conversa[]>("/chat", { headers: authHeaders() });
}

export function enviarMensagem(input: EnviarMensagemInput): Promise<ChatResposta> {
  return studyRequest<ChatResposta>("/chat", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
}

export function obterHistorico(conversaId: string): Promise<Mensagem[]> {
  return studyRequest<Mensagem[]>(`/chat/${conversaId}`, { headers: authHeaders() });
}

export function obterTrilha(): Promise<Trilha> {
  return studyRequest<Trilha>("/trilha", { headers: authHeaders() });
}
