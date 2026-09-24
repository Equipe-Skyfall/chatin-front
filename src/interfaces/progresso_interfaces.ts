import type { EstadoModulo } from "./chat_interfaces";

export interface ProgressoModulo {
  modulo_id: string;
  titulo: string;
  estado: EstadoModulo;
  melhor_pontuacao: number | null;
  tentativas_count: number;
}

export interface ProgressoTema {
  tema_id: string;
  titulo: string;
  estado: EstadoModulo;
  percentual_completo: number;
  modulos: ProgressoModulo[];
}

export interface ProgressoMateria {
  materia_id: string;
  nome: string;
  estado: EstadoModulo;
  percentual_completo: number;
  xp: number;
  temas: ProgressoTema[];
}

export interface Progresso {
  materias: ProgressoMateria[];
}
