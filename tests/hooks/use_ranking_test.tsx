// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRanking } from "@/hooks/use_ranking";

const { getRanking } = vi.hoisted(() => ({ getRanking: vi.fn() }));

vi.mock("@/lib/xp", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/xp")>()),
  getRanking,
}));

const entradas = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ posicao: i + 1, apelido: `Aluno ${i + 1}`, xp: 100 - i, eu: false }));

describe("useRanking", () => {
  beforeEach(() => {
    getRanking.mockReset();
  });

  it("carrega 20 posições e permite expandir quando a lista veio cheia", async () => {
    getRanking.mockResolvedValue({ entradas: entradas(20), minha_posicao: null });
    const { result } = renderHook(() => useRanking());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(getRanking).toHaveBeenCalledWith(20);
    expect(result.current.podeExpandir).toBe(true);

    getRanking.mockResolvedValue({ entradas: entradas(40), minha_posicao: null });
    act(() => result.current.expandir());

    await waitFor(() => expect(getRanking).toHaveBeenLastCalledWith(100));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.podeExpandir).toBe(false);
  });

  it("não oferece expandir quando a lista veio menor que o limite", async () => {
    getRanking.mockResolvedValue({ entradas: entradas(5), minha_posicao: null });
    const { result } = renderHook(() => useRanking());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.podeExpandir).toBe(false);
  });

  it("sinaliza erro e recarrega com o mesmo limite", async () => {
    getRanking.mockRejectedValueOnce(new Error("falhou"));
    const { result } = renderHook(() => useRanking());

    await waitFor(() => expect(result.current.erro).toBe(true));

    getRanking.mockResolvedValue({ entradas: entradas(3), minha_posicao: null });
    await act(() => result.current.recarregar());

    expect(result.current.erro).toBe(false);
    expect(result.current.ranking?.entradas).toHaveLength(3);
  });
});
