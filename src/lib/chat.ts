import { studyRequest } from "./api";
import type {
  ChatResposta,
  Conversa,
  EnviarMensagemInput,
  LicaoResposta,
  Mensagem,
  Trilha,
} from "@/interfaces/chat_interfaces";

const TIMEOUT_ENVIO_MS = 300000;

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
    timeoutMs: TIMEOUT_ENVIO_MS,
  });
}

export function obterHistorico(
  conversaId: string,
  admin = false,
  opcoes: { skipCache?: boolean } = {}
): Promise<Mensagem[]> {
  return studyRequest<Mensagem[]>(`${baseChat(admin)}/${conversaId}`, { skipCache: opcoes.skipCache });
}

export function obterTrilha(): Promise<Trilha> {
  return studyRequest<Trilha>("/trilha");
}

/** Abre o módulo com a explicação do assistente; repetir a chamada não reenvia a lição. */
export function iniciarLicao(moduloId: string, conversaId?: string | null): Promise<LicaoResposta> {
  return studyRequest<LicaoResposta>("/chat/licao", {
    method: "POST",
    body: JSON.stringify({ modulo_id: moduloId, conversa_id: conversaId ?? null }),
    timeoutMs: TIMEOUT_ENVIO_MS,
  });
}
