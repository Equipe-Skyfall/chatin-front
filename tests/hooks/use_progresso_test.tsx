// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProgressoResumo } from "@/lib/progresso";
import type { XpResumo } from "@/lib/xp";

const mocks = vi.hoisted(() => ({
  getMeuProgresso: vi.fn(),
  getMeuXp: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { error: mocks.toastError } }));
vi.mock("@/lib/progresso", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/progresso")>()),
  getMeuProgresso: mocks.getMeuProgresso,
}));
vi.mock("@/lib/xp", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/xp")>()),
  getMeuXp: mocks.getMeuXp,
}));

import { useProgresso } from "@/hooks/use_progresso";

const resumo: ProgressoResumo = {
  materias: [
    {
      materia_id: "m1",
      nome: "História",
      estado: "disponivel",
      percentual_completo: 0,
      xp: 30,
      temas: [
        {
          tema_id: "t1",
          titulo: "Revolução",
          estado: "disponivel",
          percentual_completo: 0,
          modulos: [
            {
              modulo_id: "mod1",
              titulo: "Causas",
              estado: "concluido",
              melhor_pontuacao: 80,
              tentativas_count: 1,
            },
            {
              modulo_id: "mod2",
              titulo: "Queda",
              estado: "disponivel",
              melhor_pontuacao: null,
              tentativas_count: 0,
            },
          ],
        },
      ],
    },
  ],
  media_acerto: 72.5,
  total_respostas: 42,
};

function xp(extra: Partial<XpResumo> = {}): XpResumo {
  return {
    xp_total: 120,
    nivel: 2,
    xp_proximo_nivel: 200,
    xp_faltando_proximo_nivel: 80,
    por_materia: [],
    ...extra,
  };
}

beforeEach(() => {
  mocks.getMeuProgresso.mockReset();
  mocks.getMeuXp.mockReset();
  mocks.toastError.mockReset();
});

describe("useProgresso", () => {
  it("carrega o progresso e o streak juntos", async () => {
    mocks.getMeuProgresso.mockResolvedValue(resumo);
    mocks.getMeuXp.mockResolvedValue(xp({ streak_atual: 5 }));

    const { result } = renderHook(() => useProgresso());

    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(mocks.getMeuProgresso).toHaveBeenCalledTimes(1);
    expect(mocks.getMeuXp).toHaveBeenCalledTimes(1);
    expect(result.current.erro).toBe(false);
    expect(result.current.streakAtual).toBe(5);
    expect(result.current.mediaAcerto).toBe(72.5);
    expect(result.current.totalRespostas).toBe(42);
    expect(result.current.materias[0].percentual_completo).toBe(50);
  });

  it("cai para null quando o backend não envia o streak", async () => {
    mocks.getMeuProgresso.mockResolvedValue(resumo);
    mocks.getMeuXp.mockResolvedValue(xp());

    const { result } = renderHook(() => useProgresso());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.streakAtual).toBeNull();
  });

  it("uma falha no XP não derruba o progresso", async () => {
    mocks.getMeuProgresso.mockResolvedValue(resumo);
    mocks.getMeuXp.mockRejectedValue(new Error("503"));

    const { result } = renderHook(() => useProgresso());

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.erro).toBe(false);
    expect(result.current.materias).toHaveLength(1);
    expect(result.current.streakAtual).toBeNull();
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });

  it("marca erro quando o progresso falha", async () => {
    mocks.getMeuProgresso.mockRejectedValue(new Error("500"));
    mocks.getMeuXp.mockResolvedValue(xp({ streak_atual: 3 }));

    const { result } = renderHook(() => useProgresso());

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.erro).toBe(true);
    expect(result.current.materias).toEqual([]);
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });

  it("recarregar busca os dados de novo", async () => {
    mocks.getMeuProgresso
      .mockResolvedValueOnce(resumo)
      .mockResolvedValueOnce({ ...resumo, media_acerto: null, total_respostas: 0 });
    mocks.getMeuXp.mockResolvedValueOnce(xp({ streak_atual: 1 })).mockResolvedValueOnce(xp({ streak_atual: 2 }));

    const { result } = renderHook(() => useProgresso());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(() => result.current.recarregar());

    expect(mocks.getMeuProgresso).toHaveBeenCalledTimes(2);
    expect(mocks.getMeuXp).toHaveBeenCalledTimes(2);
    expect(result.current.streakAtual).toBe(2);
    expect(result.current.mediaAcerto).toBeNull();
    expect(result.current.totalRespostas).toBe(0);
  });
});
