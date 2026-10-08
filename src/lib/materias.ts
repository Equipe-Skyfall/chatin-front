import { studyRequest } from "./api";

export interface Materia {
  id: string;
  nome: string;
  descricao: string;
  owner_user_id: string;
  votos: number;
  created_at: string;
}

export interface Tema {
  id: string;
  materia_id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  status: string;
  direcionamento: string;
  created_at: string;
}

export interface TemaStatus {
  tema_id: string;
  tema_status: string;
  modulos_total: number;
  modulos_prontos: number;
  modulos_com_erro: number;
  modulos_gerando: number;
  pronto_para_estudar: boolean;
}

export interface ModuloResumo {
  id: string;
  tema_id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  status: string;
  created_at: string;
}

export interface ModuloDetalhe {
  id: string;
  titulo: string;
  descricao: string;
  estado: string;
  conteudo: string;
}

export function listarMaterias(): Promise<Materia[]> {
  return studyRequest<Materia[]>("/materias");
}

export function criarMateria(payload: { nome: string; descricao: string }): Promise<Materia> {
  return studyRequest<Materia>("/materias", { method: "POST", body: JSON.stringify(payload) });
}

export function obterMateria(materiaId: string): Promise<Materia> {
  return studyRequest<Materia>(`/materias/${materiaId}`);
}

export function listarTemas(materiaId: string): Promise<Tema[]> {
  return studyRequest<Tema[]>(`/materias/${materiaId}/temas`);
}

export function criarTema(
  materiaId: string,
  payload: { titulo: string; descricao: string; direcionamento: string }
): Promise<Tema> {
  return studyRequest<Tema>(`/materias/${materiaId}/temas`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function gerarModulosAutomaticamente(temaId: string): Promise<ModuloResumo[]> {
  return studyRequest<ModuloResumo[]>(`/temas/${temaId}/modulos/gerar-automaticamente`, {
    method: "POST",
  });
}

export function obterStatusTema(temaId: string): Promise<TemaStatus> {
  return studyRequest<TemaStatus>(`/temas/${temaId}/status`, { skipCache: true });
}

export function listarModulos(temaId: string): Promise<ModuloResumo[]> {
  return studyRequest<ModuloResumo[]>(`/temas/${temaId}/modulos`, { skipCache: true });
}

export function obterModulo(moduloId: string): Promise<ModuloDetalhe> {
  return studyRequest<ModuloDetalhe>(`/modulos/${moduloId}`);
}