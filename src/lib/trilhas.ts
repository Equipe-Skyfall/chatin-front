import { studyRequest } from "@/lib/api";
import { criarMateria, criarTema, deletarMateria } from "@/lib/content";
import type {
  CotaTrilhas,
  CriarTrilhaInput,
  OrdemTrilha,
  OrigemTrilha,
  TrilhaDetalhe,
  TrilhaExplorar,
  VerificacaoTrilha,
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

/** Antes de criar: já existe uma trilha igual ou parecida? Não gasta a cota. */
export function verificarTrilha(nome: string, descricao?: string | null): Promise<VerificacaoTrilha> {
  return studyRequest<VerificacaoTrilha>("/trilhas/verificar", {
    method: "POST",
    body: JSON.stringify({ nome, descricao: descricao ?? null }),
  });
}

/**
 * Cria a trilha (matéria) e o primeiro tema; o back gera as fontes e os módulos
 * em segundo plano (`gerar_modulos`). Devolve o id da matéria criada. O limite
 * mensal chega como `ApiError` com `code === CODIGO_LIMITE_TRILHAS`. Se o tema
 * falhar, a matéria recém-criada é apagada para não sobrar trilha vazia (e a
 * vaga do mês volta, pois a cota conta as matérias existentes).
 */
export async function criarTrilha(input: CriarTrilhaInput): Promise<string> {
  const materia = await criarMateria({ nome: input.nome, descricao: input.descricao ?? null });
  try {
    await criarTema(materia.id, {
      titulo: input.tema_titulo,
      direcionamento: input.direcionamento ?? null,
      gerar_modulos: true,
    });
  } catch (error) {
    await deletarMateria(materia.id).catch(() => undefined);
    throw error;
  }
  return materia.id;
}
