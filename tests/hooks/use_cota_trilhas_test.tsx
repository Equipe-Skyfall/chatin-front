// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ obterCotaTrilhas: vi.fn() }));
vi.mock("@/lib/trilhas", () => ({ obterCotaTrilhas: mocks.obterCotaTrilhas }));

import { useCotaTrilhas } from "@/hooks/use_cota_trilhas";

const cota = (restantes: number | null) => ({ limite: 3, usadas: 3 - (restantes ?? 0), restantes, reseta_em: "2026-11-01T03:00:00Z" });

beforeEach(() => {
  mocks.obterCotaTrilhas.mockReset();
});

describe("useCotaTrilhas", () => {
  it("carrega a cota ao montar", async () => {
    mocks.obterCotaTrilhas.mockResolvedValue(cota(2));
    const { result } = renderHook(() => useCotaTrilhas());

    await waitFor(() => expect(result.current.cota?.restantes).toBe(2));
    expect(result.current.esgotada).toBe(false);
  });

  it("esgotada quando não restam vagas", async () => {
    mocks.obterCotaTrilhas.mockResolvedValue(cota(0));
    const { result } = renderHook(() => useCotaTrilhas());

    await waitFor(() => expect(result.current.esgotada).toBe(true));
  });

  it("admin (sem limite) nunca fica esgotado", async () => {
    mocks.obterCotaTrilhas.mockResolvedValue({ limite: null, usadas: 9, restantes: null, reseta_em: null });
    const { result } = renderHook(() => useCotaTrilhas());

    await waitFor(() => expect(result.current.cota).not.toBeNull());
    expect(result.current.esgotada).toBe(false);
  });

  it("se a cota falhar a tela segue sem ela", async () => {
    mocks.obterCotaTrilhas.mockImplementation(() => Promise.reject(new Error("500")));
    const { result } = renderHook(() => useCotaTrilhas());
    await act(async () => {});

    expect(mocks.obterCotaTrilhas).toHaveBeenCalled();
    expect(result.current.cota).toBeNull();
    expect(result.current.esgotada).toBe(false);
  });
});
