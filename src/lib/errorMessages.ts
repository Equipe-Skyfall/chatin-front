import { ApiError } from "./api";

const messagesByStatus: Record<number, string> = {
  400: "Dados inválidos. Confira os campos e tente novamente.",
  401: "E-mail ou senha incorretos.",
  404: "Usuário não encontrado.",
  409: "Este e-mail já está cadastrado.",
  422: "Não foi possível processar os dados enviados.",
  429: "Muitas requisições. Aguarde um instante e tente novamente.",
  500: "Erro no servidor. Tente novamente em instantes.",
};

export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const raw = error.message.toLowerCase();

    if (raw.includes("email") && raw.includes("exist")) {
      return "Este e-mail já está em uso. Tente fazer login.";
    }
    if (raw.includes("invalid") && raw.includes("credential")) {
      return "E-mail ou senha incorretos.";
    }

    return messagesByStatus[error.status] || "Algo deu errado. Tente novamente.";
  }
  return "Erro de conexão. Verifique sua internet e tente novamente.";
}

export function getStudyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Sua sessão expirou. Faça login novamente.";
    if (error.status === 403) return "Você não tem permissão para acessar este recurso.";
    if (error.status === 404) return "Recurso não encontrado.";

    return error.detail || messagesByStatus[error.status] || "Algo deu errado. Tente novamente.";
  }
  return "Erro de conexão. Verifique sua internet e tente novamente.";
}