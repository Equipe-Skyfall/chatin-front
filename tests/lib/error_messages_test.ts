import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { getFriendlyErrorMessage, getStudyErrorMessage } from "@/lib/errorMessages";

describe("getFriendlyErrorMessage (telas de login/cadastro/perfil)", () => {
  it("reconhece e-mail já cadastrado pela mensagem do backend", () => {
    const erro = new ApiError("Email already exists", 400);
    expect(getFriendlyErrorMessage(erro)).toBe("Este e-mail já está em uso. Tente fazer login.");
  });

  it("reconhece credenciais inválidas pela mensagem do backend", () => {
    const erro = new ApiError("Invalid credentials", 400);
    expect(getFriendlyErrorMessage(erro)).toBe("E-mail ou senha incorretos.");
  });

  it.each([
    [400, "Dados inválidos. Confira os campos e tente novamente."],
    [401, "E-mail ou senha incorretos."],
    [409, "Este e-mail já está cadastrado."],
    [422, "Não foi possível processar os dados enviados."],
    [429, "Muitas requisições. Aguarde um instante e tente novamente."],
    [500, "Erro no servidor. Tente novamente em instantes."],
  ])("traduz o status %i", (status, esperado) => {
    expect(getFriendlyErrorMessage(new ApiError("qualquer", status))).toBe(esperado);
  });

  it("usa mensagem genérica para status desconhecido", () => {
    expect(getFriendlyErrorMessage(new ApiError("x", 418))).toBe("Algo deu errado. Tente novamente.");
  });

  it("trata erros que não são ApiError como falha de conexão", () => {
    expect(getFriendlyErrorMessage(new TypeError("Failed to fetch"))).toBe(
      "Erro de conexão. Verifique sua internet e tente novamente."
    );
    expect(getFriendlyErrorMessage(undefined)).toBe("Erro de conexão. Verifique sua internet e tente novamente.");
  });
});

describe("getStudyErrorMessage (telas de estudo)", () => {
  it.each([
    [401, "Sua sessão expirou. Faça login novamente."],
    [403, "Você não tem permissão para acessar este recurso."],
    [404, "Recurso não encontrado."],
  ])("status %i tem mensagem fixa, mesmo com detail do backend", (status, esperado) => {
    expect(getStudyErrorMessage(new ApiError("x", status, "detalhe interno"))).toBe(esperado);
  });

  it("prefere o detail do backend nos demais status", () => {
    expect(getStudyErrorMessage(new ApiError("x", 422, "Módulo bloqueado"))).toBe("Módulo bloqueado");
  });

  it("cai na mensagem por status quando não há detail", () => {
    expect(getStudyErrorMessage(new ApiError("x", 500))).toBe("Erro no servidor. Tente novamente em instantes.");
  });

  it("usa mensagem genérica para status desconhecido sem detail", () => {
    expect(getStudyErrorMessage(new ApiError("x", 418))).toBe("Algo deu errado. Tente novamente.");
  });

  it("trata erros que não são ApiError como falha de conexão", () => {
    expect(getStudyErrorMessage(new Error("boom"))).toBe("Erro de conexão. Verifique sua internet e tente novamente.");
  });
});
