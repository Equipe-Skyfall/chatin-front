import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  studyRequest: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  default: mocks.request,
  studyRequest: mocks.studyRequest,
}));

import { ApiError } from "@/lib/api";
import { apagarDadosDoUsuario, excluirUsuario } from "@/lib/users";

beforeEach(() => {
  mocks.request.mockReset().mockResolvedValue(undefined);
  mocks.studyRequest.mockReset().mockResolvedValue({ user_id: "u1", apagados: {} });
});

describe("apagarDadosDoUsuario", () => {
  it("chama o back para apagar os dados do usuário", async () => {
    await apagarDadosDoUsuario("u1");

    expect(mocks.studyRequest).toHaveBeenCalledWith("/admin/usuarios/u1", { method: "DELETE" });
  });

  it("trata o 404 (usuário sem dados no back) como sucesso", async () => {
    mocks.studyRequest.mockRejectedValueOnce(new ApiError("Sem dados", 404));

    await expect(apagarDadosDoUsuario("u1")).resolves.toBeUndefined();
  });

  it("propaga os outros erros do back", async () => {
    mocks.studyRequest.mockRejectedValueOnce(new ApiError("Erro interno", 500));

    await expect(apagarDadosDoUsuario("u1")).rejects.toMatchObject({ status: 500 });
  });
});

describe("excluirUsuario", () => {
  it("apaga os dados no back e depois o login no serviço de autenticação, nessa ordem", async () => {
    const ordem: string[] = [];
    mocks.studyRequest.mockImplementationOnce(async () => ordem.push("back"));
    mocks.request.mockImplementationOnce(async () => ordem.push("login"));

    await excluirUsuario("u1");

    expect(ordem).toEqual(["back", "login"]);
    expect(mocks.request).toHaveBeenCalledWith("/users/u1", { method: "DELETE" });
  });

  it("exclui o login mesmo quando o usuário não tinha dados no back (404)", async () => {
    mocks.studyRequest.mockRejectedValueOnce(new ApiError("Sem dados", 404));

    await excluirUsuario("u1");

    expect(mocks.request).toHaveBeenCalledWith("/users/u1", { method: "DELETE" });
  });

  it("não exclui o login quando apagar os dados falha, para o admin poder tentar de novo", async () => {
    mocks.studyRequest.mockRejectedValueOnce(new ApiError("Erro interno", 500));

    await expect(excluirUsuario("u1")).rejects.toMatchObject({ status: 500 });
    expect(mocks.request).not.toHaveBeenCalled();
  });
});
