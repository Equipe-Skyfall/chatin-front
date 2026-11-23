// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  listarResumos: vi.fn(),
  obterResumo: vi.fn(),
  tratarErro: vi.fn(),
}));

vi.mock("@/lib/resumos", () => ({
  LIMITE_RESUMOS_PAGINA: 20,
  listarResumos: mocks.listarResumos,
  obterResumo: mocks.obterResumo,
}));
vi.mock("@/hooks/use_study_error", () => ({
  useStudyErrorHandler: () => mocks.tratarErro,
}));

import { useResumos } from "@/hooks/use_resumos";

function listItem(id: string) {
  return {
    id,
    modulo_id: "mod1",
    titulo: `Resumo ${id}`,
    materia_nome: "História",
    tema_titulo: "Revolução",
    modulo_titulo: "Causas",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

function resumo(id: string) {
  return {
    ...listItem(id),
    conversa_id: null,
    conteudo: {
      visao_geral: "Visão geral",
      conceitos_chave: [],
      pontos_importantes: [],
      exemplos: [],
      duvidas_do_aluno: [],
      revisao_rapida: [],
      fontes: [],
    },
    modelo_ia: null,
    created_at: "2026-01-01T00:00:00Z",
  };
}

beforeEach(() => {
  localStorage.clear();
  mocks.listarResumos.mockReset().mockResolvedValue([listItem("r1")]);
  mocks.obterResumo.mockReset().mockImplementation(async (id: string) => resumo(id));
  mocks.tratarErro.mockReset();
});

async function montar() {
  const hook = renderHook(() => useResumos());
  await waitFor(() => expect(hook.result.current.carregando).toBe(false));
  return hook;
}

describe("useResumos - abertura de resumos (revisão contada pelo back)", () => {
  it("abre o visualizador buscando o resumo no back", async () => {
    const { result } = await montar();

    await act(() => result.current.abrir("r1"));

    expect(result.current.resumoAberto?.id).toBe("r1");
    expect(mocks.obterResumo).toHaveBeenCalledWith("r1");
  });

  it("reabrir o mesmo resumo busca de novo, para o back contar outra revisão", async () => {
    const { result } = await montar();

    await act(() => result.current.abrir("r1"));
    await act(() => result.current.abrir("r1"));

    expect(mocks.obterResumo).toHaveBeenCalledTimes(2);
  });

  it("não guarda mais a contagem no navegador", async () => {
    const { result } = await montar();

    await act(() => result.current.abrir("r1"));

    expect(localStorage.getItem("chatin:resumos-revisao")).toBeNull();
  });

  it("trata o erro quando a abertura falha", async () => {
    mocks.obterResumo.mockRejectedValueOnce(new Error("falhou"));
    const { result } = await montar();

    await act(() => result.current.abrir("r1"));

    expect(result.current.resumoAberto).toBeNull();
    expect(mocks.tratarErro).toHaveBeenCalled();
  });
});
