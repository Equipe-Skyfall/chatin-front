import { ApiError } from "./api";

const messagesByStatus: Record<number, string> = {
  400: "Dados inválidos. Confira os campos e tente novamente.",
  401: "E-mail ou senha incorretos.",
  404: "Usuário não encontrado.",
  409: "Este e-mail já está cadastrado.",
  422: "Não foi possível processar os dados enviados.",
  500: "Erro no servidor. Tente novamente em instantes.",
};

export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return messagesByStatus[error.status] || error.message || "Algo deu errado. Tente novamente.";
  }
  return "Erro de conexão. Verifique sua internet e tente novamente.";
}