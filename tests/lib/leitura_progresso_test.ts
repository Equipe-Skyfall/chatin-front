// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  contarLidos,
  lerProgressoLeitura,
  limparProgressoLeitura,
  moduloParaRetomar,
  progressoDaMateria,
  recomendarModulo,
  registrarModuloAcessado,
  registrarModuloConcluido,
} from "@/lib/leitura_progresso";

beforeEach(() => {
  localStorage.clear();
});

describe("leitura_progresso - registro e persistência", () => {
  it("registra módulos acessados sem duplicar, na ordem de acesso", () => {
    registrarModuloAcessado("mat1", "m1");
    registrarModuloAcessado("mat1", "m2");
    registrarModuloAcessado("mat1", "m1");

    expect(progressoDaMateria("mat1")?.acessados).toEqual(["m1", "m2"]);
  });

  it("guarda o último módulo acessado para retomada", () => {
    registrarModuloAcessado("mat1", "m1");
    registrarModuloAcessado("mat1", "m2");

    expect(progressoDaMateria("mat1")?.ultimoModuloId).toBe("m2");
  });

  it("concluir a leitura também marca o módulo como acessado", () => {
    const progresso = registrarModuloConcluido("mat1", "m1");

    expect(progresso.acessados).toEqual(["m1"]);
    expect(progresso.concluidos).toEqual(["m1"]);
  });

  it("persiste o progresso (sobrevive a uma nova leitura do storage)", () => {
    registrarModuloConcluido("mat1", "m1");

    expect(progressoDaMateria("mat1")?.concluidos).toEqual(["m1"]);
    expect(lerProgressoLeitura()).toHaveProperty("mat1");
  });

  it("separa o progresso por matéria", () => {
    registrarModuloAcessado("mat1", "a");
    registrarModuloAcessado("mat2", "z");

    expect(progressoDaMateria("mat1")?.acessados).toEqual(["a"]);
    expect(progressoDaMateria("mat2")?.acessados).toEqual(["z"]);
  });

  it("tolera um storage corrompido", () => {
    localStorage.setItem("chatin:progresso-leitura", "{isso-não-é-json");

    expect(lerProgressoLeitura()).toEqual({});
    expect(progressoDaMateria("mat1")).toBeNull();
  });

  it("limpa o progresso", () => {
    registrarModuloConcluido("mat1", "m1");
    limparProgressoLeitura();

    expect(lerProgressoLeitura()).toEqual({});
  });
});

describe("leitura_progresso - retomada e recomendação", () => {
  it("retoma o último módulo acessado quando ele segue acessível e não lido", () => {
    registrarModuloAcessado("mat1", "m2");

    expect(moduloParaRetomar(progressoDaMateria("mat1"), ["m1", "m2", "m3"])).toBe("m2");
  });

  it("não retoma um módulo já lido", () => {
    registrarModuloConcluido("mat1", "m2");

    expect(moduloParaRetomar(progressoDaMateria("mat1"), ["m1", "m2", "m3"])).toBeNull();
  });

  it("não retoma um módulo que saiu da ordem acessível", () => {
    registrarModuloAcessado("mat1", "m2");

    expect(moduloParaRetomar(progressoDaMateria("mat1"), ["m1", "m3"])).toBeNull();
  });

  it("recomenda retomar; senão o primeiro não lido; senão o primeiro da ordem", () => {
    expect(recomendarModulo(progressoDaMateria("mat1"), ["m1", "m2"])).toBe("m1");

    registrarModuloConcluido("mat1", "m1");
    expect(recomendarModulo(progressoDaMateria("mat1"), ["m1", "m2"])).toBe("m2");

    registrarModuloConcluido("mat1", "m2");
    expect(recomendarModulo(progressoDaMateria("mat1"), ["m1", "m2"])).toBe("m1");
  });

  it("recomenda null quando não há módulos", () => {
    expect(recomendarModulo(progressoDaMateria("mat1"), [])).toBeNull();
  });

  it("conta apenas os módulos da lista informada", () => {
    registrarModuloConcluido("mat1", "m1");
    registrarModuloConcluido("mat1", "fora");

    expect(contarLidos(progressoDaMateria("mat1"), ["m1", "m2"])).toBe(1);
    expect(contarLidos(null, ["m1"])).toBe(0);
  });
});
