import { studyRequest } from "./api";
import type {
  Materia,
  MateriaInput,
  Modulo,
  ModuloInput,
  ModuloUpdateInput,
  Tema,
  TemaInput,
  TemaUpdateInput,
} from "@/interfaces/content_interfaces";

export function listarMaterias(): Promise<Materia[]> {
  return studyRequest<Materia[]>("/materias");
}

export function criarMateria(input: MateriaInput): Promise<Materia> {
  return studyRequest<Materia>("/materias", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function atualizarMateria(materiaId: string, input: MateriaInput): Promise<Materia> {
  return studyRequest<Materia>(`/materias/${materiaId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deletarMateria(materiaId: string): Promise<void> {
  return studyRequest<void>(`/materias/${materiaId}`, { method: "DELETE" });
}

export function listarTemas(materiaId: string): Promise<Tema[]> {
  return studyRequest<Tema[]>(`/materias/${materiaId}/temas`);
}

export function criarTema(materiaId: string, input: TemaInput): Promise<Tema> {
  return studyRequest<Tema>(`/materias/${materiaId}/temas`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function atualizarTema(materiaId: string, temaId: string, input: TemaUpdateInput): Promise<Tema> {
  return studyRequest<Tema>(`/materias/${materiaId}/temas/${temaId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deletarTema(materiaId: string, temaId: string): Promise<void> {
  return studyRequest<void>(`/materias/${materiaId}/temas/${temaId}`, { method: "DELETE" });
}

export function regenerarTema(materiaId: string, temaId: string): Promise<Tema> {
  return studyRequest<Tema>(`/materias/${materiaId}/temas/${temaId}/regenerar`, {
    method: "POST",
  });
}

export function listarModulos(temaId: string, opcoes: { skipCache?: boolean } = {}): Promise<Modulo[]> {
  return studyRequest<Modulo[]>(`/temas/${temaId}/modulos`, { skipCache: opcoes.skipCache });
}

export function criarModulo(temaId: string, input: ModuloInput): Promise<Modulo> {
  return studyRequest<Modulo>(`/temas/${temaId}/modulos`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function atualizarModulo(temaId: string, moduloId: string, input: ModuloUpdateInput): Promise<Modulo> {
  return studyRequest<Modulo>(`/temas/${temaId}/modulos/${moduloId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deletarModulo(temaId: string, moduloId: string): Promise<void> {
  return studyRequest<void>(`/temas/${temaId}/modulos/${moduloId}`, { method: "DELETE" });
}

export function gerarModulosAutomaticamente(temaId: string): Promise<Modulo[]> {
  return studyRequest<Modulo[]>(`/temas/${temaId}/modulos/gerar-automaticamente`, {
    method: "POST",
  });
}

export function regenerarModulo(temaId: string, moduloId: string, instrucoes?: string | null): Promise<Modulo> {
  return studyRequest<Modulo>(`/temas/${temaId}/modulos/${moduloId}/regenerar`, {
    method: "POST",
    body: JSON.stringify({ instrucoes: instrucoes ?? null }),
  });
}

export function regenerarQuestionarioModulo(temaId: string, moduloId: string): Promise<Modulo> {
  return studyRequest<Modulo>(`/temas/${temaId}/modulos/${moduloId}/questionario/regenerar`, {
    method: "POST",
  });
}
