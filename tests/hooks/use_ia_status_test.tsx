// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  dispensarAvisoIa,
  marcarIaDisponivel,
  marcarIaIndisponivel,
  useIaStatus,
} from "@/hooks/use_ia_status";

beforeEach(() => {
  marcarIaDisponivel();
});

describe("useIaStatus", () => {
  it("começa disponível, sem aviso visível", () => {
    const { result } = renderHook(() => useIaStatus());

    expect(result.current.indisponivel).toBe(false);
    expect(result.current.avisoVisivel).toBe(false);
  });

  it("mostra o aviso quando a IA fica indisponível", () => {
    const { result } = renderHook(() => useIaStatus());

    act(() => marcarIaIndisponivel());

    expect(result.current.indisponivel).toBe(true);
    expect(result.current.avisoVisivel).toBe(true);
  });

  it("fechar o aviso o esconde, mas mantém a indisponibilidade registrada", () => {
    const { result } = renderHook(() => useIaStatus());

    act(() => marcarIaIndisponivel());
    act(() => result.current.dispensar());

    expect(result.current.avisoVisivel).toBe(false);
    expect(result.current.indisponivel).toBe(true);
  });

  it("uma nova falha reexibe o aviso depois de dispensado", () => {
    const { result } = renderHook(() => useIaStatus());

    act(() => marcarIaIndisponivel());
    act(() => dispensarAvisoIa());
    expect(result.current.avisoVisivel).toBe(false);

    act(() => marcarIaIndisponivel());
    expect(result.current.avisoVisivel).toBe(true);
  });

  it("volta ao normal quando uma operação de IA dá certo", () => {
    const { result } = renderHook(() => useIaStatus());

    act(() => marcarIaIndisponivel());
    act(() => marcarIaDisponivel());

    expect(result.current.indisponivel).toBe(false);
    expect(result.current.avisoVisivel).toBe(false);
  });
});
