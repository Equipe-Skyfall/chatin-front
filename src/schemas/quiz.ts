import { z } from "zod";

export const estadoProgressoSchema = z.enum(["bloqueado", "disponivel", "concluido"]);

export const trilhaModuloSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  ordem: z.number(),
  estado: estadoProgressoSchema,
});

export const trilhaTemaSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  ordem: z.number(),
  estado: estadoProgressoSchema,
  modulos: z.array(trilhaModuloSchema),
});

export const trilhaMateriaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  temas: z.array(trilhaTemaSchema),
});
export type TrilhaMateria = z.infer<typeof trilhaMateriaSchema>;

export const trilhaSchema = z.object({
  materias: z.array(trilhaMateriaSchema),
});
export type Trilha = z.infer<typeof trilhaSchema>;

export const alternativaSchema = z.object({
  letra: z.enum(["A", "B", "C", "D", "E"]),
  texto: z.string(),
});

// Client-facing shape - structurally incapable of carrying the gabarito,
// mirrors QuestaoOut on the backend (no resposta_correta field at all).
export const questaoSchema = z.object({
  id: z.string(),
  ordem: z.number(),
  enunciado: z.string(),
  alternativas: z.array(alternativaSchema),
});
export type Questao = z.infer<typeof questaoSchema>;

export const tentativaIniciarSchema = z.object({
  tentativa_id: z.string(),
  questoes: z.array(questaoSchema),
  pratica: z.boolean(),
  questionario_id: z.string().nullable(),
  tema_id: z.string().nullable(),
});
export type TentativaIniciar = z.infer<typeof tentativaIniciarSchema>;

// This is where the gabarito actually shows up - only after answering.
export const respostaResultadoSchema = z.object({
  questao_id: z.string(),
  resposta_escolhida: z.enum(["A", "B", "C", "D", "E"]),
  resposta_correta: z.enum(["A", "B", "C", "D", "E"]),
  correta: z.boolean(),
  explicacao: z.string().nullable(),
});
export type RespostaResultado = z.infer<typeof respostaResultadoSchema>;

export const tentativaResultadoSchema = z.object({
  id: z.string(),
  questionario_id: z.string().nullable(),
  tema_id: z.string().nullable(),
  pontuacao: z.number(),
  total_questoes: z.number(),
  total_corretas: z.number(),
  resultados: z.array(respostaResultadoSchema),
});
export type TentativaResultado = z.infer<typeof tentativaResultadoSchema>;
