// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  contarRevisoes,
  lerRevisoes,
  limparRevisoes,
  registrarRevisao,
  revisoesDoResumo,
} from "@/lib/resumos_revisao";

beforeEach(() => {
  localStorage.clear();
});

describe("resumos_revisao - registro e persistência", () => {
  it("conta cada abertura no total", () => {
    registrarRevisao("r1");
    registrarRevisao("r2");

    expect(contarRevisoes()).toBe(2);
  });

  it("reabrir o mesmo resumo conta de novo", () => {
    registrarRevisao("r1");
    registrarRevisao("r1");

    expect(contarRevisoes()).toBe(2);
    expect(revisoesDoResumo("r1")).toBe(2);
  });

  it("separa a contagem por resumo", () => {
    registrarRevisao("r1");
    registrarRevisao("r1");
    registrarRevisao("r2");

    expect(revisoesDoResumo("r1")).toBe(2);
    expect(revisoesDoResumo("r2")).toBe(1);
    expect(revisoesDoResumo("inexistente")).toBe(0);
  });

  it("guarda a data da última abertura de cada resumo", () => {
    const estado = registrarRevisao("r1");

    expect(estado.porResumo.r1.ultimaEm).not.toBe("");
    expect(estado.atualizadoEm).toBe(estado.porResumo.r1.ultimaEm);
  });

  it("persiste as revisões (sobrevive a uma nova leitura do storage)", () => {
    registrarRevisao("r1");

    expect(lerRevisoes().total).toBe(1);
    expect(contarRevisoes()).toBe(1);
  });

  it("tolera um storage corrompido", () => {
    localStorage.setItem("chatin:resumos-revisao", "{isso-não-é-json");

    expect(lerRevisoes()).toEqual({ total: 0, porResumo: {}, atualizadoEm: "" });
    expect(contarRevisoes()).toBe(0);
  });

  it("limpa as revisões", () => {
    registrarRevisao("r1");
    limparRevisoes();

    expect(contarRevisoes()).toBe(0);
    expect(lerRevisoes().porResumo).toEqual({});
  });
});
