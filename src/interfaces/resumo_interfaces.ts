export interface ConceitoChave {
  termo: string;
  explicacao: string;
}

export interface DuvidaResolvida {
  pergunta: string;
  resposta: string;
}

export interface ResumoEstudoConteudo {
  visao_geral: string;
  conceitos_chave: ConceitoChave[];
  pontos_importantes: string[];
  exemplos: string[];
  duvidas_do_aluno: DuvidaResolvida[];
  revisao_rapida: string[];
  fontes: string[];
}

export interface ResumoEstudoListItem {
  id: string;
  modulo_id: string;
  titulo: string;
  materia_nome: string | null;
  tema_titulo: string | null;
  modulo_titulo: string | null;
  updated_at: string;
}

export interface ResumoEstudo extends ResumoEstudoListItem {
  conversa_id: string | null;
  conteudo: ResumoEstudoConteudo;
  modelo_ia: string | null;
  created_at: string;
}
