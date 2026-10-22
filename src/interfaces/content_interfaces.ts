export interface Materia {
  id: string;
  nome: string;
  descricao: string | null;
  /** Nulo = currículo oficial (criado por admin), sem aluno dono. */
  owner_user_id: string | null;
  votos: number;
  created_at: string;
}

export interface MateriaInput {
  nome: string;
  descricao?: string | null;
}

export interface Tema {
  id: string;
  materia_id: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  status: string;
  direcionamento: string | null;
  created_at: string;
}

export interface TemaInput {
  titulo: string;
  descricao?: string | null;
  direcionamento?: string | null;
  /** Encadeia, em segundo plano, a pesquisa de fontes e a divisão em módulos. */
  gerar_modulos?: boolean;
}

export interface TemaUpdateInput {
  titulo?: string;
  descricao?: string | null;
  ordem?: number;
  direcionamento?: string | null;
}

export interface Modulo {
  id: string;
  tema_id: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  status: string;
  created_at: string;
}

export interface ModuloInput {
  titulo: string;
  descricao?: string | null;
  conteudo?: string | null;
}

export interface ModuloUpdateInput {
  titulo?: string;
  descricao?: string | null;
  ordem?: number;
}
