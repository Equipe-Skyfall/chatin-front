import { describe, expect, it } from "vitest";
import type { EstadoModulo } from "@/interfaces/chat_interfaces";
import { comProgressoPorModulos, type MateriaProgresso } from "@/lib/progresso";

function modulo(moduloId: string, estado: EstadoModulo) {
  return { modulo_id: moduloId, titulo: moduloId, estado, melhor_pontuacao: null, tentativas_count: 0 };
}

function materia(
  temas: { tema_id: string; estados: EstadoModulo[] }[],
  percentualBackend = 0
): MateriaProgresso {
  return {
    materia_id: "m1",
    nome: "História",
    estado: "disponivel",
    percentual_completo: percentualBackend,
    xp: 30,
    temas: temas.map(({ tema_id, estados }) => ({
      tema_id,
      titulo: tema_id,
      estado: "disponivel",
      percentual_completo: 0,
      modulos: estados.map((estado, index) => modulo(`${tema_id}-${index}`, estado)),
    })),
  };
}

describe("comProgressoPorModulos", () => {
  it("conta módulos concluídos no total da matéria, ignorando o valor por temas do backend", () => {
    const [resultado] = comProgressoPorModulos([
      materia(
        [
          { tema_id: "t1", estados: ["concluido", "disponivel"] },
          { tema_id: "t2", estados: ["disponivel", "disponivel"] },
        ],
        100
      ),
    ]);

    expect(resultado.percentual_completo).toBe(25);
  });

  it("chega a 100% com todos os módulos concluídos, mesmo com temas em aberto", () => {
    const [resultado] = comProgressoPorModulos([
      materia([{ tema_id: "t1", estados: ["concluido", "concluido"] }], 0),
    ]);

    expect(resultado.percentual_completo).toBe(100);
  });

  it("fica em 0% quando a matéria não tem módulos", () => {
    const [resultado] = comProgressoPorModulos([materia([])]);

    expect(resultado.percentual_completo).toBe(0);
  });

  it("preserva os demais campos e não altera a matéria original", () => {
    const original = materia([{ tema_id: "t1", estados: ["concluido", "disponivel"] }], 0);

    const [resultado] = comProgressoPorModulos([original]);

    expect(resultado.nome).toBe("História");
    expect(resultado.xp).toBe(30);
    expect(resultado.temas[0].modulos).toHaveLength(2);
    expect(original.percentual_completo).toBe(0);
  });
});
