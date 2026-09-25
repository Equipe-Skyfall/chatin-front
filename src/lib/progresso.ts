import { studyRequest } from "./api";
import type { EstadoModulo } from "@/interfaces/chat_interfaces";

export interface ModuloProgresso {
  modulo_id: string;
  titulo: string;
  estado: EstadoModulo;
  melhor_pontuacao: number | null;
  tentativas_count: number;
}

export interface TemaProgresso {
  tema_id: string;
  titulo: string;
  estado: EstadoModulo;
  percentual_completo: number;
  modulos: ModuloProgresso[];
}

export interface MateriaProgresso {
  materia_id: string;
  nome: string;
  estado: EstadoModulo;
  percentual_completo: number;
  xp: number;
  temas: TemaProgresso[];
}

export interface ProgressoResumo {
  materias: MateriaProgresso[];
}

export async function getMeuProgresso(): Promise<ProgressoResumo> {
  return studyRequest<ProgressoResumo>("/progresso", { skipCache: true });
}

const ESTADO_LABELS: Record<EstadoModulo, string> = {
  bloqueado: "Bloqueado",
  disponivel: "Disponível",
  concluido: "Concluído",
};

export function estadoLabel(estado: EstadoModulo): string {
  return ESTADO_LABELS[estado] ?? estado;
}

export function estadoBadgeClass(estado: EstadoModulo): string {
  switch (estado) {
    case "concluido":
      return "bg-green-50 text-green-700";
    case "disponivel":
      return "bg-orange/10 text-orange";
    case "bloqueado":
      return "bg-gray-100 text-gray";
    default:
      return "bg-gray-100 text-gray";
  }
}

export interface ProgressoAgregado {
  totalMaterias: number;
  materiasConcluidas: number;
  xpTotal: number;
  percentualMedio: number;
}

export function calcularAgregado(materias: MateriaProgresso[]): ProgressoAgregado {
  const totalMaterias = materias.length;
  const materiasConcluidas = materias.filter((m) => m.estado === "concluido").length;
  const xpTotal = materias.reduce((soma, m) => soma + m.xp, 0);
  const percentualMedio =
    totalMaterias === 0
      ? 0
      : Math.round(materias.reduce((soma, m) => soma + m.percentual_completo, 0) / totalMaterias);

  return { totalMaterias, materiasConcluidas, xpTotal, percentualMedio };
}

export interface ProximoModulo {
  moduloId: string;
  titulo: string;
}

/**
 * Acha o próximo módulo "acionável" de uma matéria: primeiro módulo não concluído
 * e não bloqueado, percorrendo os tópicos na ordem em que vêm da API.
 * Se todos os não-bloqueados já estiverem concluídos, cai no primeiro não-bloqueado
 * (permite reabrir/revisar). Retorna null se não houver nenhum módulo acessível.
 */
export function getProximoModulo(materia: MateriaProgresso): ProximoModulo | null {
  for (const tema of materia.temas) {
    for (const modulo of tema.modulos) {
      if (modulo.estado !== "concluido" && modulo.estado !== "bloqueado") {
        return { moduloId: modulo.modulo_id, titulo: modulo.titulo };
      }
    }
  }

  for (const tema of materia.temas) {
    for (const modulo of tema.modulos) {
      if (modulo.estado !== "bloqueado") {
        return { moduloId: modulo.modulo_id, titulo: modulo.titulo };
      }
    }
  }

  return null;
}