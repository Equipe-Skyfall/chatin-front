export type MotivoRecomendacao = "nao_estudado" | "baixo_desempenho" | "revisao_espacada";

export interface Recomendacao {
  posicao: number;
  modulo_id: string;
  modulo_titulo: string;
  tema_id: string;
  tema_titulo: string;
  materia_id: string;
  materia_nome: string;
  motivo: MotivoRecomendacao;
  justificativa: string;
  prioridade: number;
  ultimo_estudo: string | null;
  dias_desde_ultimo_estudo: number | null;
  taxa_acerto_tema: number | null;
}

export interface RecomendacoesResposta {
  recomendacoes: Recomendacao[];
}
