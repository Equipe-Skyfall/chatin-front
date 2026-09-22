import { studyRequest } from "./api";
import type { ResumoEstudo, ResumoEstudoListItem } from "@/interfaces/resumo_interfaces";

export const LIMITE_RESUMOS_PAGINA = 20;

export interface ListarResumosParams {
  limit?: number;
  offset?: number;
  materiaId?: string;
}

export function listarResumos({
  limit,
  offset,
  materiaId,
}: ListarResumosParams = {}): Promise<ResumoEstudoListItem[]> {
  const params = new URLSearchParams();
  if (limit != null) params.set("limit", String(limit));
  if (offset != null) params.set("offset", String(offset));
  if (materiaId) params.set("materia_id", materiaId);

  const query = params.toString();
  return studyRequest<ResumoEstudoListItem[]>(`/resumos${query ? `?${query}` : ""}`);
}

export function obterResumo(id: string): Promise<ResumoEstudo> {
  return studyRequest<ResumoEstudo>(`/resumos/${id}`);
}

export function gerarResumo(conversaId: string): Promise<ResumoEstudo> {
  return studyRequest<ResumoEstudo>("/resumos", {
    method: "POST",
    body: JSON.stringify({ conversa_id: conversaId }),
  });
}

/** URL do PDF gerado on-demand pelo backend, servida pelo proxy autenticado. */
export function urlPdfResumo(id: string): string {
  return `/api/study/resumos/${id}/pdf`;
}
