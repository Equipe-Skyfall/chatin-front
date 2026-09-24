import { describe, expect, it } from "vitest";
import { tentativaIniciarSchema, tentativaResultadoSchema, trilhaSchema } from "@/schemas/quiz";

const questao = {
  id: "q1",
  ordem: 1,
  enunciado: "Quanto é 2 + 2?",
  alternativas: [
    { letra: "A", texto: "3" },
    { letra: "B", texto: "4" },
  ],
};

describe("tentativaIniciarSchema (questionário entregue ao aluno)", () => {
  it("aceita uma tentativa válida", () => {
    const resultado = tentativaIniciarSchema.safeParse({
      tentativa_id: "t1",
      questoes: [questao],
      pratica: false,
      questionario_id: "qz1",
      tema_id: null,
    });
    expect(resultado.success).toBe(true);
  });

  it("descarta o gabarito caso o backend o envie por engano", () => {
    const tentativa = tentativaIniciarSchema.parse({
      tentativa_id: "t1",
      questoes: [{ ...questao, resposta_correta: "B", explicacao: "2+2=4" }],
      pratica: true,
      questionario_id: null,
      tema_id: null,
    });

    expect(tentativa.questoes[0]).not.toHaveProperty("resposta_correta");
    expect(tentativa.questoes[0]).not.toHaveProperty("explicacao");
  });

  it("rejeita letra de alternativa fora de A-E", () => {
    const resultado = tentativaIniciarSchema.safeParse({
      tentativa_id: "t1",
      questoes: [{ ...questao, alternativas: [{ letra: "F", texto: "x" }] }],
      pratica: true,
      questionario_id: null,
      tema_id: null,
    });
    expect(resultado.success).toBe(false);
  });
});

describe("tentativaResultadoSchema (resultado após responder)", () => {
  const resultado = {
    id: "t1",
    questionario_id: "qz1",
    tema_id: null,
    pontuacao: 50,
    total_questoes: 2,
    total_corretas: 1,
    resultados: [
      { questao_id: "q1", resposta_escolhida: "B", resposta_correta: "B", correta: true, explicacao: null },
      { questao_id: "q2", resposta_escolhida: "A", resposta_correta: "C", correta: false, explicacao: "Porque sim" },
    ],
  };

  it("aceita um resultado válido com gabarito", () => {
    expect(tentativaResultadoSchema.parse(resultado).resultados[1].resposta_correta).toBe("C");
  });

  it("rejeita resultado sem o campo `correta`", () => {
    const quebrado = {
      ...resultado,
      resultados: [{ questao_id: "q1", resposta_escolhida: "A", resposta_correta: "B", explicacao: null }],
    };
    expect(tentativaResultadoSchema.safeParse(quebrado).success).toBe(false);
  });
});

describe("trilhaSchema (trilha de estudos)", () => {
  it("aceita apenas os estados conhecidos de progresso", () => {
    const trilha = (estado: string) => ({
      materias: [
        {
          id: "m1",
          nome: "Matemática",
          temas: [{ id: "t1", titulo: "Álgebra", ordem: 1, estado, modulos: [] }],
        },
      ],
    });

    expect(trilhaSchema.safeParse(trilha("disponivel")).success).toBe(true);
    expect(trilhaSchema.safeParse(trilha("bloqueado")).success).toBe(true);
    expect(trilhaSchema.safeParse(trilha("concluido")).success).toBe(true);
    expect(trilhaSchema.safeParse(trilha("em_andamento")).success).toBe(false);
  });
});
