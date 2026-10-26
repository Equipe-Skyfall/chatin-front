// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { Recomendacao } from "@/interfaces/recomendacao_interfaces";

const mocks = vi.hoisted(() => ({ listarRecomendacoes: vi.fn() }));

vi.mock("@/lib/recomendacoes", () => ({
  LIMITE_RECOMENDACOES: 3,
  listarRecomendacoes: mocks.listarRecomendacoes,
}));

import { useRecomendacao } from "@/hooks/use_recomendacao";

function recomendacao(extra: Partial<Recomendacao> = {}): Recomendacao {
  return {
    posicao: 0,
    modulo_id: "mod1",
    modulo_titulo: "Causas",
    tema_id: "t1",
    tema_titulo: "Revolução",
    materia_id: "m1",
    materia_nome: "História",
    motivo: "nao_estudado",
    justificativa: "Você ainda não estudou este módulo.",
    prioridade: 1,
    ultimo_estudo: null,
    dias_desde_ultimo_estudo: null,
    taxa_acerto_tema: null,
    ...extra,
  };
}

beforeEach(() => {
  mocks.listarRecomendacoes.mockReset();
});

describe("useRecomendacao", () => {
  it("expõe as sugestões na ordem de urgência e pede até três", async () => {
    mocks.listarRecomendacoes.mockResolvedValue({
      recomendacoes: [recomendacao(), recomendacao({ modulo_id: "mod2", posicao: 1 })],
    });

    const { result } = renderHook(() => useRecomendacao());

    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.recomendacoes.map((r) => r.modulo_id)).toEqual(["mod1", "mod2"]);
    expect(mocks.listarRecomendacoes).toHaveBeenCalledWith(3);
  });

  it("fica sem sugestões quando o aluno não tem nada aberto", async () => {
    mocks.listarRecomendacoes.mockResolvedValue({ recomendacoes: [] });

    const { result } = renderHook(() => useRecomendacao());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.recomendacoes).toEqual([]);
  });

  it("falha em silêncio: fica sem sugestões e não quebra a tela", async () => {
    mocks.listarRecomendacoes.mockRejectedValue(new Error("503"));

    const { result } = renderHook(() => useRecomendacao());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.recomendacoes).toEqual([]);
  });
});
