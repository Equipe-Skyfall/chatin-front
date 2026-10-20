// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { TemaStatus } from "@/lib/materias";

const mocks = vi.hoisted(() => ({
  obterStatusTema: vi.fn(),
  gerarModulosAutomaticamente: vi.fn(),
  loading: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}));

vi.mock("@/lib/materias", () => ({
  obterStatusTema: mocks.obterStatusTema,
  gerarModulosAutomaticamente: mocks.gerarModulosAutomaticamente,
}));
vi.mock("sonner", () => ({
  toast: { loading: mocks.loading, success: mocks.success, error: mocks.error, info: mocks.info },
}));

import { iniciarGeracaoApostila, limparGeracoes, useGeracaoApostila } from "@/hooks/use_geracao_apostila";

function status(overrides: Partial<TemaStatus> = {}): TemaStatus {
  return {
    tema_id: "t1",
    tema_status: "gerando",
    modulos_total: 0,
    modulos_prontos: 0,
    modulos_com_erro: 0,
    modulos_gerando: 0,
    pronto_para_estudar: false,
    ...overrides,
  };
}

const dados = { materiaId: "mat1", materiaNome: "Biologia", temaId: "t1" };

async function avancar(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  limparGeracoes();
  mocks.obterStatusTema.mockReset();
  mocks.gerarModulosAutomaticamente.mockReset().mockResolvedValue([]);
  mocks.loading.mockReset();
  mocks.success.mockReset();
  mocks.error.mockReset();
  mocks.info.mockReset();
});

afterEach(() => {
  limparGeracoes();
  vi.useRealTimers();
});

describe("use_geracao_apostila (geração em segundo plano)", () => {
  it("acompanha sem bloquear e avisa quando fica pronta", async () => {
    mocks.obterStatusTema
      .mockResolvedValueOnce(status({ tema_status: "gerando" }))
      .mockResolvedValueOnce(status({ tema_status: "pronto" }))
      .mockResolvedValue(
        status({ tema_status: "pronto", modulos_total: 2, modulos_prontos: 2, pronto_para_estudar: true })
      );

    const { result } = renderHook(() => useGeracaoApostila());

    act(() => {
      iniciarGeracaoApostila(dados);
    });

    expect(result.current.geracoes).toHaveLength(1);
    expect(mocks.loading).toHaveBeenCalled();

    // 1º poll: tema ainda reunindo fontes -> não pede módulos.
    await avancar(0);
    expect(mocks.gerarModulosAutomaticamente).not.toHaveBeenCalled();

    // 2º poll: tema 'pronto' -> pede a geração dos módulos.
    await avancar(3000);
    expect(mocks.gerarModulosAutomaticamente).toHaveBeenCalledWith("t1");

    // 3º poll: módulos prontos -> conclui e avisa.
    await avancar(3000);
    expect(result.current.geracoes).toHaveLength(0);
    expect(mocks.success).toHaveBeenCalled();
  });

  it("avisa erro e encerra quando o tema falha", async () => {
    mocks.obterStatusTema.mockResolvedValue(status({ tema_status: "erro" }));

    const { result } = renderHook(() => useGeracaoApostila());
    act(() => {
      iniciarGeracaoApostila(dados);
    });

    await avancar(0);

    expect(mocks.error).toHaveBeenCalled();
    expect(result.current.geracoes).toHaveLength(0);
  });

  it("avisa erro quando todos os módulos falham", async () => {
    mocks.obterStatusTema.mockResolvedValue(
      status({ tema_status: "pronto", modulos_total: 3, modulos_com_erro: 3, modulos_gerando: 0 })
    );

    const { result } = renderHook(() => useGeracaoApostila());
    act(() => {
      iniciarGeracaoApostila(dados);
    });

    await avancar(0);

    expect(mocks.error).toHaveBeenCalled();
    expect(result.current.geracoes).toHaveLength(0);
  });
});
