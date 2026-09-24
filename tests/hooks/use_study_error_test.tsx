// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { ApiError } from "@/lib/api";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  toastError: vi.fn(),
  logout: vi.fn(),
  verificarSessao: vi.fn(),
  limparSessao: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("sonner", () => ({ toast: { error: mocks.toastError } }));
vi.mock("@/lib/auth", () => ({ logout: mocks.logout }));
vi.mock("@/hooks/use_session", () => ({
  verificarSessao: mocks.verificarSessao,
  limparSessao: mocks.limparSessao,
}));

import { useStudyErrorHandler } from "@/hooks/use_study_error";

function tratador() {
  return renderHook(() => useStudyErrorHandler()).result.current;
}

beforeEach(() => {
  mocks.logout.mockResolvedValue(undefined);
});

describe("useStudyErrorHandler (tratamento de erro das telas de estudo)", () => {
  it("401 com sessão realmente expirada: desloga e manda para o login", async () => {
    mocks.verificarSessao.mockResolvedValue({ user: null, estado: "anonimo" });

    await tratador()(new ApiError("Não autenticado", 401));

    expect(mocks.verificarSessao).toHaveBeenCalledWith(true);
    expect(mocks.logout).toHaveBeenCalled();
    expect(mocks.limparSessao).toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith("Sua sessão expirou. Faça login novamente.");
    expect(mocks.push).toHaveBeenCalledWith("/");
  });

  it("401 com a sessão ainda válida: só avisa, sem deslogar", async () => {
    mocks.verificarSessao.mockResolvedValue({ user: { id: "u1" }, estado: "autenticado" });

    await tratador()(new ApiError("Não autenticado", 401));

    expect(mocks.logout).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith("Não foi possível concluir a operação agora. Tente novamente.");
  });

  it("401 com auth indisponível: não desloga o usuário", async () => {
    mocks.verificarSessao.mockResolvedValue({ user: null, estado: "indisponivel" });

    await tratador()(new ApiError("Não autenticado", 401));

    expect(mocks.logout).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("outros erros da API mostram a mensagem amigável (detail do backend)", async () => {
    await tratador()(new ApiError("x", 422, "Módulo bloqueado"));

    expect(mocks.toastError).toHaveBeenCalledWith("Módulo bloqueado");
    expect(mocks.verificarSessao).not.toHaveBeenCalled();
  });

  it("erro de rede mostra mensagem de conexão", async () => {
    await tratador()(new TypeError("Failed to fetch"));

    expect(mocks.toastError).toHaveBeenCalledWith("Erro de conexão. Verifique sua internet e tente novamente.");
  });
});
