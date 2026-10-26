// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { ApiError } from "@/lib/api";
import { MENSAGEM_IA_INDISPONIVEL } from "@/lib/errorMessages";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  toastError: vi.fn(),
  logout: vi.fn(),
  verificarSessao: vi.fn(),
  limparSessao: vi.fn(),
  marcarIaIndisponivel: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("sonner", () => ({ toast: { error: mocks.toastError } }));
vi.mock("@/lib/auth", () => ({ logout: mocks.logout }));
vi.mock("@/hooks/use_session", () => ({
  verificarSessao: mocks.verificarSessao,
  limparSessao: mocks.limparSessao,
}));
vi.mock("@/hooks/use_ia_status", () => ({ marcarIaIndisponivel: mocks.marcarIaIndisponivel }));

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

describe("useStudyErrorHandler - sinal de indisponibilidade da IA ({ ia: true })", () => {
  it("falha de IA sinaliza globalmente e usa a mensagem de indisponibilidade", async () => {
    await tratador()(new ApiError("x", 503), { ia: true });

    expect(mocks.marcarIaIndisponivel).toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(MENSAGEM_IA_INDISPONIVEL);
  });

  it("4xx de uma ação de IA cai no toast comum (não é indisponibilidade)", async () => {
    await tratador()(new ApiError("x", 422, "Módulo bloqueado"), { ia: true });

    expect(mocks.marcarIaIndisponivel).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith("Módulo bloqueado");
  });

  it("sem a flag de IA, um 5xx não acende o aviso global", async () => {
    await tratador()(new ApiError("x", 500));

    expect(mocks.marcarIaIndisponivel).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith("Erro no servidor. Tente novamente em instantes.");
  });
});
