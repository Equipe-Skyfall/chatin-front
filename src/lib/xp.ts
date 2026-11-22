// lib/xp.ts
import { studyRequest } from "./api";

export interface XpPorMateria {
  materia_id: string;
  materia_nome: string;
  xp: number;
}

export interface XpResumo {
  xp_total: number;
  streak_atual?: number;
  nivel: number;
  xp_proximo_nivel: number;
  xp_faltando_proximo_nivel: number;
  por_materia: XpPorMateria[];
}

export async function getMeuXp(): Promise<XpResumo> {
  return studyRequest<XpResumo>("/xp/meu", { skipCache: true });
}

export function calcularProgressoNivel(xp: XpResumo): number {
  if (xp.xp_proximo_nivel <= 0) return 0;
  const progresso = (xp.xp_total / xp.xp_proximo_nivel) * 100;
  return Math.min(100, Math.max(0, Math.round(progresso)));
}

export interface XpGanho {
  xpGanho: number;
  subiuDeNivel: boolean;
  nivelAnterior: number;
  nivelNovo: number;
}

export function compararXp(antes: XpResumo, depois: XpResumo): XpGanho {
  return {
    xpGanho: Math.max(0, depois.xp_total - antes.xp_total),
    subiuDeNivel: depois.nivel > antes.nivel,
    nivelAnterior: antes.nivel,
    nivelNovo: depois.nivel,
  };
}

export interface RankingEntrada {
  posicao: number;
  apelido: string;
  xp: number;
  eu: boolean;
}

export interface Ranking {
  entradas: RankingEntrada[];
  minha_posicao: RankingEntrada | null;
}

// Formato do `GET /ranking`: `nome` já traz o apelido escolhido (nunca o nome real).
interface RankingApi {
  entradas: { posicao: number; nome: string; xp: number; voce: boolean }[];
  minha_posicao: number | null;
  meu_xp: number;
}

export async function getRanking(limit = 20): Promise<Ranking> {
  const api = await studyRequest<RankingApi>(`/ranking?limit=${limit}`, { skipCache: true });
  const entradas = api.entradas.map(({ posicao, nome, xp, voce }) => ({ posicao, apelido: nome, xp, eu: voce }));
  const minha = entradas.find((entrada) => entrada.eu);
  return {
    entradas,
    minha_posicao:
      api.minha_posicao === null
        ? null
        : (minha ?? { posicao: api.minha_posicao, apelido: "Você", xp: api.meu_xp, eu: true }),
  };
}
