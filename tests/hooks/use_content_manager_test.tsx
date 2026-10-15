// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { Materia } from "@/interfaces/content_interfaces";

const mocks = vi.hoisted(() => ({
  listarMaterias: vi.fn(),
  listarTemas: vi.fn(),
  listarModulos: vi.fn(),
  criarMateria: vi.fn(),
  regenerarTema: vi.fn(),
  marcarIaDisponivel: vi.fn(),
  tratarErro: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/lib/content", () => ({
  atualizarMateria: vi.fn(),
  atualizarModulo: vi.fn(),
  atualizarTema: vi.fn(),
  criarMateria: mocks.criarMateria,
  criarModulo: vi.fn(),
  criarTema: vi.fn(),
  deletarMateria: vi.fn(),
  deletarModulo: vi.fn(),
  deletarTema: vi.fn(),
  gerarModulosAutomaticamente: vi.fn(),
  listarMaterias: mocks.listarMaterias,
  listarModulos: mocks.listarModulos,
  listarTemas: mocks.listarTemas,
  regenerarModulo: vi.fn(),
  regenerarQuestionarioModulo: vi.fn(),
  regenerarTema: mocks.regenerarTema,
}));
vi.mock("@/hooks/use_study_error", () => ({ useStudyErrorHandler: () => mocks.tratarErro }));
vi.mock("@/hooks/use_ia_status", () => ({ marcarIaDisponivel: mocks.marcarIaDisponivel }));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));

import { useContentManager } from "@/hooks/use_content_manager";

const materia: Materia = { id: "m1", nome: "Matemática", descricao: null, created_at: "2026-01-01T00:00:00Z" };

beforeEach(() => {
  mocks.listarMaterias.mockResolvedValue([]);
  mocks.listarTemas.mockResolvedValue([]);
  mocks.listarModulos.mockResolvedValue([]);
});

async function montar() {
  const hook = renderHook(() => useContentManager());
  await waitFor(() => expect(hook.result.current.carregandoMaterias).toBe(false));
  return hook;
}

describe("useContentManager - sinal de IA por ação", () => {
  it("ação de IA que dá certo recupera o estado (marcarIaDisponivel)", async () => {
    mocks.regenerarTema.mockResolvedValue(undefined);
    const { result } = await montar();

    await act(async () => {
      result.current.selecionarMateria("m1");
    });
    await act(async () => {
      await result.current.regenerarTemaComIa("t1");
    });

    expect(mocks.marcarIaDisponivel).toHaveBeenCalled();
    expect(mocks.tratarErro).not.toHaveBeenCalled();
  });

  it("ação de IA que falha vai para o tratador com { ia: true }", async () => {
    const erro = new Error("503");
    mocks.regenerarTema.mockRejectedValue(erro);
    const { result } = await montar();

    await act(async () => {
      result.current.selecionarMateria("m1");
    });
    await act(async () => {
      await result.current.regenerarTemaComIa("t1");
    });

    expect(mocks.tratarErro).toHaveBeenCalledWith(erro, { ia: true });
    expect(mocks.marcarIaDisponivel).not.toHaveBeenCalled();
  });

  it("ação comum (não-IA) não mexe no estado da IA", async () => {
    mocks.criarMateria.mockResolvedValue(materia);
    const { result } = await montar();

    await act(async () => {
      await result.current.adicionarMateria({ nome: "Matemática" });
    });

    expect(mocks.marcarIaDisponivel).not.toHaveBeenCalled();
    expect(mocks.tratarErro).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Matéria criada.");
  });

  it("ação comum que falha vai para o tratador sem a flag de IA", async () => {
    const erro = new Error("500");
    mocks.criarMateria.mockRejectedValue(erro);
    const { result } = await montar();

    await act(async () => {
      await result.current.adicionarMateria({ nome: "Matemática" });
    });

    expect(mocks.tratarErro).toHaveBeenCalledWith(erro, { ia: false });
    expect(mocks.marcarIaDisponivel).not.toHaveBeenCalled();
  });
});
