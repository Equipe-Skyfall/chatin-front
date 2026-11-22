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
import { contarRevisoes, revisoesDoResumo } from "@/lib/resumos_revisao";

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

describe("useResumos - revisões da Biblioteca", () => {
  it("conta a abertura de um resumo e abre o visualizador", async () => {
    const { result } = await montar();

    await act(() => result.current.abrir("r1"));

    expect(result.current.resumoAberto?.id).toBe("r1");
    expect(contarRevisoes()).toBe(1);
    expect(revisoesDoResumo("r1")).toBe(1);
  });

  it("reabrir o mesmo resumo conta de novo", async () => {
    const { result } = await montar();

    await act(() => result.current.abrir("r1"));
    await act(() => result.current.abrir("r1"));

    expect(contarRevisoes()).toBe(2);
    expect(revisoesDoResumo("r1")).toBe(2);
  });

  it("não conta quando a abertura falha", async () => {
    mocks.obterResumo.mockRejectedValueOnce(new Error("falhou"));
    const { result } = await montar();

    await act(() => result.current.abrir("r1"));

    expect(result.current.resumoAberto).toBeNull();
    expect(contarRevisoes()).toBe(0);
    expect(mocks.tratarErro).toHaveBeenCalled();
  });
});
