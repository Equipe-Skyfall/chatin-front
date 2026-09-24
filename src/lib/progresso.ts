import { studyRequest } from "./api";

export interface ModuloProgresso {
  modulo_id: string;
  titulo: string;
  estado: string;
  melhor_pontuacao: number;
  tentativas_count: number;
}

export interface TemaProgresso {
  tema_id: string;
  titulo: string;
  estado: string;
  percentual_completo: number;
  modulos: ModuloProgresso[];
}

export interface MateriaProgresso {
  materia_id: string;
  nome: string;
  estado: string;
  percentual_completo: number;
  xp: number;
  temas: TemaProgresso[];
}

export interface ProgressoResumo {
  materias: MateriaProgresso[];
}

export async function getMeuProgresso(): Promise<ProgressoResumo> {
  return studyRequest<ProgressoResumo>("/progresso");
}

const ESTADO_LABELS: Record<string, string> = {
  bloqueado: "Bloqueado",
  disponivel: "Disponível",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

export function estadoLabel(estado: string): string {
  return ESTADO_LABELS[estado] ?? estado.charAt(0).toUpperCase() + estado.slice(1).replace(/_/g, " ");
}

export function estadoBadgeClass(estado: string): string {
  switch (estado) {
    case "concluido":
      return "bg-green-50 text-green-700";
    case "em_andamento":
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