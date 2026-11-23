// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { limparRevisoes } from "@/lib/resumos_revisao";

const CHAVE = "chatin:resumos-revisao";

beforeEach(() => {
  localStorage.clear();
});

describe("resumos_revisao - limpeza da contagem antiga do navegador", () => {
  it("remove a contagem antiga guardada no localStorage", () => {
    localStorage.setItem(CHAVE, JSON.stringify({ total: 3, porResumo: {}, atualizadoEm: "" }));

    limparRevisoes();

    expect(localStorage.getItem(CHAVE)).toBeNull();
  });

  it("não mexe em outras chaves do app", () => {
    localStorage.setItem("chatin:progresso-leitura", "{}");

    limparRevisoes();

    expect(localStorage.getItem("chatin:progresso-leitura")).toBe("{}");
  });

  it("não falha quando não há nada salvo", () => {
    expect(() => limparRevisoes()).not.toThrow();
  });
});
