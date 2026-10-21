import { studyRequest } from "@/lib/api";
import { criarMateria, criarTema } from "@/lib/content";
import type {
  CotaTrilhas,
  CriarTrilhaInput,
  OrdemTrilha,
  OrigemTrilha,
  TrilhaDetalhe,
  TrilhaExplorar,
  VotoTrilha,
} from "@/interfaces/trilha_interfaces";

export const TRILHAS_POR_PAGINA = 20;

export function explorarTrilhas(
  origem: OrigemTrilha,
  ordem: OrdemTrilha,
  opcoes: { limite?: number; offset?: number } = {}
): Promise<TrilhaExplorar[]> {
  const params = new URLSearchParams({
    origem,
    ordem,
    limite: String(opcoes.limite ?? TRILHAS_POR_PAGINA),
    offset: String(opcoes.offset ?? 0),
  });
  return studyRequest<TrilhaExplorar[]>(`/trilhas/explorar?${params}`);
}

export function obterTrilhaDetalhe(materiaId: string): Promise<TrilhaDetalhe> {
  return studyRequest<TrilhaDetalhe>(`/trilhas/${materiaId}`);
}

export function obterCotaTrilhas(): Promise<CotaTrilhas> {
  return studyRequest<CotaTrilhas>("/trilhas/cota", { skipCache: true });
}

export function estudarTrilha(materiaId: string): Promise<{ materia_id: string; estudando: boolean }> {
  return studyRequest(`/trilhas/${materiaId}/estudar`, { method: "POST" });
}

export function pararDeEstudarTrilha(materiaId: string): Promise<{ materia_id: string; estudando: boolean }> {
  return studyRequest(`/trilhas/${materiaId}/estudar`, { method: "DELETE" });
}

export function votarTrilha(materiaId: string, valor: VotoTrilha): Promise<{ votos: number }> {
  return studyRequest(`/materias/${materiaId}/votar`, {
    method: "POST",
    body: JSON.stringify({ valor }),
  });
}

export function removerVotoTrilha(materiaId: string): Promise<{ votos: number }> {
  return studyRequest(`/materias/${materiaId}/votar`, { method: "DELETE" });
}

/**
 * Cria a trilha (matéria) e o primeiro tema; o back gera as fontes e os módulos
 * em segundo plano (`gerar_modulos`). Devolve o id da matéria criada. O limite
 * mensal chega como `ApiError` com `code === CODIGO_LIMITE_TRILHAS`.
 */
export async function criarTrilha(input: CriarTrilhaInput): Promise<string> {
  const materia = await criarMateria({ nome: input.nome, descricao: input.descricao ?? null });
  await criarTema(materia.id, {
    titulo: input.tema_titulo,
    direcionamento: input.direcionamento ?? null,
    gerar_modulos: true,
  });
  return materia.id;
}
