import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

vi.mock("@/lib/api", () => ({ studyRequest: vi.fn() }));

import { studyRequest } from "@/lib/api";
import {
  gerarQuestionarioPersonalizado,
  getTrilha,
  iniciarTentativaModulo,
  responderTentativa,
} from "@/lib/quizApi";

const studyRequestMock = vi.mocked(studyRequest);

const tentativa = {
  tentativa_id: "t1",
  questoes: [{ id: "q1", ordem: 1, enunciado: "?", alternativas: [{ letra: "A", texto: "x" }] }],
  pratica: true,
  questionario_id: null,
  tema_id: null,
};

beforeEach(() => {
  studyRequestMock.mockReset();
});

describe("quizApi (chamadas da tela de questionários)", () => {
  it("getTrilha busca /trilha e valida a resposta", async () => {
    studyRequestMock.mockResolvedValue({ materias: [] });

    await expect(getTrilha()).resolves.toEqual({ materias: [] });
    expect(studyRequestMock).toHaveBeenCalledWith("/trilha");
  });

  it("getTrilha falha com ZodError se o backend mudar o formato", async () => {
    studyRequestMock.mockResolvedValue({ materias: "nada" });

    await expect(getTrilha()).rejects.toBeInstanceOf(ZodError);
  });

  it("gerarQuestionarioPersonalizado faz POST no módulo", async () => {
    studyRequestMock.mockResolvedValue(tentativa);

    await gerarQuestionarioPersonalizado("mod-1");

    expect(studyRequestMock).toHaveBeenCalledWith("/modulos/mod-1/questionario-personalizado", { method: "POST" });
  });

  it("iniciarTentativaModulo faz POST em /tentativas e remove o gabarito", async () => {
    studyRequestMock.mockResolvedValue({
      ...tentativa,
      questoes: [{ ...tentativa.questoes[0], resposta_correta: "A" }],
    });

    const resultado = await iniciarTentativaModulo("mod-1");

    expect(studyRequestMock).toHaveBeenCalledWith("/modulos/mod-1/tentativas", { method: "POST" });
    expect(resultado.questoes[0]).not.toHaveProperty("resposta_correta");
  });

  it("responderTentativa envia as respostas no corpo", async () => {
    studyRequestMock.mockResolvedValue({
      id: "t1",
      questionario_id: null,
      tema_id: null,
      pontuacao: 100,
      total_questoes: 1,
      total_corretas: 1,
      resultados: [],
    });
    const respostas = [{ questao_id: "q1", resposta_escolhida: "A" }];

    await responderTentativa("t1", respostas);

    expect(studyRequestMock).toHaveBeenCalledWith("/tentativas/t1/responder", {
      method: "POST",
      body: JSON.stringify({ respostas }),
    });
  });
});
