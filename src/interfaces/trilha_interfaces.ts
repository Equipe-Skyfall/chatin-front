export type OrigemTrilha = "todas" | "verificadas" | "comunidade";
export type OrdemTrilha = "votos" | "alunos" | "recentes";
export type VotoTrilha = 1 | -1;

export interface TrilhaExplorar {
  id: string;
  nome: string;
  descricao: string | null;
  /** True = currículo oficial (criado por admin). False = trilha de um aluno. */
  verificada: boolean;
  autor_nome: string | null;
  votos: number;
  meu_voto: VotoTrilha | null;
  temas: number;
  modulos: number;
  alunos: number;
  estudando: boolean;
  pronta: boolean;
  created_at: string;
}

export interface TrilhaDetalheModulo {
  id: string;
  titulo: string;
  ordem: number;
}

export interface TrilhaDetalheTema {
  id: string;
  titulo: string;
  ordem: number;
  modulos: TrilhaDetalheModulo[];
}

export interface TrilhaDetalhe extends TrilhaExplorar {
  conteudo: TrilhaDetalheTema[];
}

export interface CotaTrilhas {
  /** Nulo = sem limite (admin). */
  limite: number | null;
  usadas: number;
  restantes: number | null;
  reseta_em: string;
}

export interface CriarTrilhaInput {
  nome: string;
  descricao?: string | null;
  tema_titulo: string;
  direcionamento?: string | null;
}

export const CODIGO_LIMITE_TRILHAS = "LIMITE_TRILHAS_MENSAL";
