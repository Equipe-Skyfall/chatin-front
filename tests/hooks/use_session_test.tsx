// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const { getSessionMock } = vi.hoisted(() => ({ getSessionMock: vi.fn() }));

vi.mock("@/lib/auth", () => ({ getSession: getSessionMock }));

type ModuloSessao = typeof import("@/hooks/use_session");

const usuario = { id: "u1", email: "ana@chatin.com", username: "ana", role: "ADMIN" as const };

// O hook guarda a sessão em estado de módulo (compartilhado entre
// componentes). Reimportar a cada teste garante que um não vaze no outro.
let modulo: ModuloSessao;

beforeEach(async () => {
  vi.resetModules();
  getSessionMock.mockReset();
  modulo = await import("@/hooks/use_session");
});

describe("useSession (sessão no cliente)", () => {
  it("começa carregando e expõe o usuário e a role depois da busca", async () => {
    getSessionMock.mockResolvedValue(usuario);

    const { result } = renderHook(() => modulo.useSession());
    expect(result.current.carregando).toBe(true);

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.user).toEqual(usuario);
    expect(result.current.role).toBe("ADMIN");
    expect(result.current.indisponivel).toBe(false);
  });

  it("vários componentes usando o hook disparam UMA única busca", async () => {
    getSessionMock.mockResolvedValue(usuario);

    const a = renderHook(() => modulo.useSession());
    const b = renderHook(() => modulo.useSession());
    const c = renderHook(() => modulo.useSession());

    await waitFor(() => expect(c.result.current.carregando).toBe(false));
    expect(a.result.current.user).toEqual(usuario);
    expect(b.result.current.user).toEqual(usuario);
    expect(getSessionMock).toHaveBeenCalledTimes(1);
  });

  it("usuário anônimo: user null e role null", async () => {
    getSessionMock.mockResolvedValue(null);

    const { result } = renderHook(() => modulo.useSession());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.indisponivel).toBe(false);
  });

  it("falha no serviço marca a sessão como indisponível", async () => {
    getSessionMock.mockRejectedValue(new Error("503"));

    const { result } = renderHook(() => modulo.useSession());

    await waitFor(() => expect(result.current.indisponivel).toBe(true));
    expect(result.current.carregando).toBe(false);
  });

  it("indisponibilidade mantém o usuário já conhecido (não desloga)", async () => {
    getSessionMock.mockResolvedValueOnce(usuario).mockRejectedValueOnce(new Error("503"));

    const { result } = renderHook(() => modulo.useSession());
    await waitFor(() => expect(result.current.user).toEqual(usuario));

    await act(() => result.current.recarregar());

    expect(result.current.indisponivel).toBe(true);
    expect(result.current.user).toEqual(usuario);
  });

  it("recarregar força uma nova busca", async () => {
    getSessionMock.mockResolvedValue(usuario);

    const { result } = renderHook(() => modulo.useSession());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(() => result.current.recarregar());

    expect(getSessionMock).toHaveBeenCalledTimes(2);
  });

  it("limparSessao (após login/logout) volta a carregar e busca de novo", async () => {
    getSessionMock.mockResolvedValueOnce(null).mockResolvedValueOnce(usuario);

    const { result } = renderHook(() => modulo.useSession());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    act(() => modulo.limparSessao());

    await waitFor(() => expect(result.current.user).toEqual(usuario));
    expect(getSessionMock).toHaveBeenCalledTimes(2);
  });
});
