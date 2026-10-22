import { studyRequest } from "./api";
import type { RecomendacoesResposta } from "@/interfaces/recomendacao_interfaces";

/** Quantas sugestões o tip do Início mostra. */
export const LIMITE_RECOMENDACOES = 3;

export function listarRecomendacoes(limite = LIMITE_RECOMENDACOES): Promise<RecomendacoesResposta> {
  const params = new URLSearchParams({ limite: String(limite) });
  return studyRequest<RecomendacoesResposta>(`/recomendacao?${params}`, { skipCache: true });
}
