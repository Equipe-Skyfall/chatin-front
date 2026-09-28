import { studyRequest as request } from "./api";
import {
  Trilha,
  trilhaSchema,
  TentativaIniciar,
  tentativaIniciarSchema,
  TentativaResultado,
  tentativaResultadoSchema,
} from "@/schemas/quiz";

export async function getTrilha(): Promise<Trilha> {
  const data = await request<unknown>("/trilha");
  return trilhaSchema.parse(data);
}

export async function gerarQuestionarioPersonalizado(moduloId: string): Promise<TentativaIniciar> {
  const data = await request<unknown>(`/modulos/${moduloId}/questionario-personalizado`, {
    method: "POST",
  });
  return tentativaIniciarSchema.parse(data);
}

export async function iniciarTentativaModulo(moduloId: string): Promise<TentativaIniciar> {
  const data = await request<unknown>(`/modulos/${moduloId}/tentativas`, { method: "POST" });
  return tentativaIniciarSchema.parse(data);
}

export async function responderTentativa(
  tentativaId: string,
  respostas: { questao_id: string; resposta_escolhida: string }[]
): Promise<TentativaResultado> {
  const data = await request<unknown>(`/tentativas/${tentativaId}/responder`, {
    method: "POST",
    body: JSON.stringify({ respostas }),
  });
  return tentativaResultadoSchema.parse(data);
}
