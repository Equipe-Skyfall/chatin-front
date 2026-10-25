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
  /** Criada por este aluno: não sai da lista de estudos. */
  propria: boolean;
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

export type StatusVerificacaoTrilha = "nova" | "parecidas" | "igual";

export interface TrilhaSimilar extends TrilhaExplorar {
  /** Similaridade de cosseno com a trilha proposta (0 a 1). */
  similaridade: number;
}

export interface VerificacaoTrilha {
  /** igual: já existe equivalente; parecidas: há próximas; nova: pode criar. */
  status: StatusVerificacaoTrilha;
  /** Título corrigido pela IA (ortografia, acentos, capitalização). */
  nome_normalizado: string;
  similares: TrilhaSimilar[];
}

export const CODIGO_LIMITE_TRILHAS = "LIMITE_TRILHAS_MENSAL";
