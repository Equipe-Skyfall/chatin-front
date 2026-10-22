// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  criarMateria: vi.fn(),
  criarTema: vi.fn(),
  iniciarGeracaoApostila: vi.fn(),
}));

vi.mock("@/lib/materias", () => ({
  criarMateria: mocks.criarMateria,
  criarTema: mocks.criarTema,
}));
vi.mock("@/hooks/use_geracao_apostila", () => ({
  iniciarGeracaoApostila: mocks.iniciarGeracaoApostila,
}));
vi.mock("@/lib/errorMessages", () => ({ getFriendlyErrorMessage: () => "erro amigável" }));

import { useCriarMateria } from "@/hooks/use_criar_materia";

const dados = { nome: "Biologia", descricao: "Células", titulo: "Membrana", direcionamento: "Explique" };

beforeEach(() => {
  mocks.criarMateria.mockReset().mockResolvedValue({ id: "mat1", nome: "Biologia" });
  mocks.criarTema.mockReset().mockResolvedValue({ id: "t1" });
  mocks.iniciarGeracaoApostila.mockReset();
});

describe("useCriarMateria", () => {
  it("cria matéria + tema, dispara a geração em background e avisa o pai", async () => {
    const onCriada = vi.fn();
    const { result } = renderHook(() => useCriarMateria(onCriada));

    await act(async () => {
      await result.current.criar(dados);
    });

    expect(mocks.criarMateria).toHaveBeenCalledWith({ nome: "Biologia", descricao: "Células" });
    expect(mocks.criarTema).toHaveBeenCalledWith("mat1", {
      titulo: "Membrana",
      descricao: "Células",
      direcionamento: "Explique",
    });
    expect(mocks.iniciarGeracaoApostila).toHaveBeenCalledWith({
      materiaId: "mat1",
      materiaNome: "Biologia",
      temaId: "t1",
    });
    expect(onCriada).toHaveBeenCalledWith("mat1");
    expect(result.current.etapa).toBe("formulario");
  });

  it("vai para erro e não dispara a geração quando a criação falha", async () => {
    mocks.criarTema.mockRejectedValue(new Error("boom"));
    const onCriada = vi.fn();
    const { result } = renderHook(() => useCriarMateria(onCriada));

    await act(async () => {
      await result.current.criar(dados);
    });

    expect(result.current.etapa).toBe("erro");
    expect(mocks.iniciarGeracaoApostila).not.toHaveBeenCalled();
    expect(onCriada).not.toHaveBeenCalled();
  });
});
