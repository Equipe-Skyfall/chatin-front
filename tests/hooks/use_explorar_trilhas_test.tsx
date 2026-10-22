// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { TrilhaExplorar } from "@/interfaces/trilha_interfaces";

const mocks = vi.hoisted(() => ({
  explorarTrilhas: vi.fn(),
  estudarTrilha: vi.fn(),
  pararDeEstudarTrilha: vi.fn(),
  votarTrilha: vi.fn(),
  removerVotoTrilha: vi.fn(),
  tratarErro: vi.fn(),
  success: vi.fn(),
}));

vi.mock("@/lib/trilhas", () => ({
  TRILHAS_POR_PAGINA: 2,
  explorarTrilhas: mocks.explorarTrilhas,
  estudarTrilha: mocks.estudarTrilha,
  pararDeEstudarTrilha: mocks.pararDeEstudarTrilha,
  votarTrilha: mocks.votarTrilha,
  removerVotoTrilha: mocks.removerVotoTrilha,
}));
vi.mock("@/hooks/use_study_error", () => ({ useStudyErrorHandler: () => mocks.tratarErro }));
vi.mock("sonner", () => ({ toast: { success: mocks.success, error: vi.fn() } }));

import { useExplorarTrilhas } from "@/hooks/use_explorar_trilhas";

function trilha(id: string, extra: Partial<TrilhaExplorar> = {}): TrilhaExplorar {
  return {
    id,
    nome: `Trilha ${id}`,
    descricao: null,
    verificada: false,
    autor_nome: "Ana",
    votos: 3,
    meu_voto: null,
    temas: 1,
    modulos: 2,
    alunos: 4,
    estudando: false,
    propria: false,
    pronta: true,
    created_at: "2026-10-01T00:00:00Z",
    ...extra,
  };
}

beforeEach(() => {
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.explorarTrilhas.mockResolvedValue([trilha("a"), trilha("b")]);
});

describe("useExplorarTrilhas", () => {
  it("carrega a primeira página com os filtros padrão", async () => {
    const { result } = renderHook(() => useExplorarTrilhas());

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(mocks.explorarTrilhas).toHaveBeenCalledWith("todas", "votos", { limite: 2, offset: 0 });
    expect(result.current.trilhas.map((t) => t.id)).toEqual(["a", "b"]);
    expect(result.current.temMais).toBe(true);
  });

  it("recarrega ao mudar a origem e a ordem", async () => {
    const { result } = renderHook(() => useExplorarTrilhas());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    act(() => result.current.setOrigem("verificadas"));
    await waitFor(() =>
      expect(mocks.explorarTrilhas).toHaveBeenLastCalledWith("verificadas", "votos", {
        limite: 2,
        offset: 0,
      })
    );
    act(() => result.current.setOrdem("alunos"));
    await waitFor(() =>
      expect(mocks.explorarTrilhas).toHaveBeenLastCalledWith("verificadas", "alunos", {
        limite: 2,
        offset: 0,
      })
    );
  });

  it("carregar mais acrescenta sem duplicar e encerra quando a página vem curta", async () => {
    const { result } = renderHook(() => useExplorarTrilhas());
    await waitFor(() => expect(result.current.carregando).toBe(false));
    mocks.explorarTrilhas.mockResolvedValueOnce([trilha("b"), trilha("c")]);

    await act(() => result.current.carregarMais());
    expect(result.current.trilhas.map((t) => t.id)).toEqual(["a", "b", "c"]);
    expect(mocks.explorarTrilhas).toHaveBeenLastCalledWith("todas", "votos", { limite: 2, offset: 2 });

    mocks.explorarTrilhas.mockResolvedValueOnce([trilha("d")]);
    await act(() => result.current.carregarMais());
    expect(result.current.temMais).toBe(false);
  });

  it("falha na lista marca erro e usa o tratador", async () => {
    const erro = new Error("500");
    mocks.explorarTrilhas.mockRejectedValue(erro);

    const { result } = renderHook(() => useExplorarTrilhas());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.erro).toBe(true);
    expect(mocks.tratarErro).toHaveBeenCalledWith(erro);
  });

  it("estudar marca a trilha como estudada e soma um aluno", async () => {
    mocks.estudarTrilha.mockResolvedValue({ estudando: true });
    const { result } = renderHook(() => useExplorarTrilhas());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(() => result.current.estudar(result.current.trilhas[0]));

    expect(mocks.estudarTrilha).toHaveBeenCalledWith("a");
    expect(result.current.trilhas[0]).toMatchObject({ estudando: true, alunos: 5 });
    expect(result.current.ocupadaId).toBeNull();
  });

  it("falha ao estudar não altera a trilha e vai para o tratador", async () => {
    const erro = new Error("404");
    mocks.estudarTrilha.mockRejectedValue(erro);
    const { result } = renderHook(() => useExplorarTrilhas());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(() => result.current.estudar(result.current.trilhas[0]));

    expect(result.current.trilhas[0].estudando).toBe(false);
    expect(mocks.tratarErro).toHaveBeenCalledWith(erro);
  });

  it("parar de estudar desmarca e tira um aluno", async () => {
    mocks.explorarTrilhas.mockResolvedValue([trilha("a", { estudando: true })]);
    mocks.pararDeEstudarTrilha.mockResolvedValue({ estudando: false });
    const { result } = renderHook(() => useExplorarTrilhas());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(() => result.current.pararDeEstudar(result.current.trilhas[0]));

    expect(result.current.trilhas[0]).toMatchObject({ estudando: false, alunos: 3 });
  });

  it("votar registra o voto e votar de novo no mesmo sentido o remove", async () => {
    mocks.votarTrilha.mockResolvedValue({ votos: 4 });
    mocks.removerVotoTrilha.mockResolvedValue({ votos: 3 });
    const { result } = renderHook(() => useExplorarTrilhas());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(() => result.current.votar(result.current.trilhas[0], 1));
    expect(mocks.votarTrilha).toHaveBeenCalledWith("a", 1);
    expect(result.current.trilhas[0]).toMatchObject({ votos: 4, meu_voto: 1 });

    await act(() => result.current.votar(result.current.trilhas[0], 1));
    expect(mocks.removerVotoTrilha).toHaveBeenCalledWith("a");
    expect(result.current.trilhas[0]).toMatchObject({ votos: 3, meu_voto: null });
  });
});
