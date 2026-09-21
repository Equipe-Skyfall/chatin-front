import { studyRequest } from "./api";

export interface XpPorMateria {
  materia_id: string;
  materia_nome: string;
  xp: number;
}

export interface XpResumo {
  xp_total: number;
  nivel: number;
  xp_proximo_nivel: number;
  xp_faltando_proximo_nivel: number;
  por_materia: XpPorMateria[];
}

export async function getMeuXp(): Promise<XpResumo> {
  return studyRequest<XpResumo>("/xp/meu");
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