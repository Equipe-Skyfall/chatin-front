import { ApiError } from "./api";

/**
 * Aviso único para quando a IA (chat, resumo, geração de conteúdo) está fora do
 * ar. Ele orienta o aluno a seguir navegando e tentar de novo depois, em vez de
 * travar a tela.
 */
export const MENSAGEM_IA_INDISPONIVEL =
  "A IA está indisponível no momento. Você pode continuar navegando e tentar novamente em instantes.";

/**
 * Sinais de que o serviço de IA está indisponível: falha de conexão (0), timeout
 * do cliente (408 - endpoints de IA são os que estouram o tempo) ou erro de
 * servidor/gateway (>= 500). Erros de validação/permissão do próprio pedido
 * (4xx) não contam - são falhas daquela ação, não indisponibilidade da IA.
 */
export function ehIaIndisponivel(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.status === 0 || error.status === 408 || error.status >= 500;
}

const messagesByStatus: Record<number, string> = {
  400: "Dados inválidos. Confira os campos e tente novamente.",
  401: "E-mail ou senha incorretos.",
  404: "Usuário não encontrado.",
  409: "Este nome de usuário ou e-mail já está cadastrado.",
  422: "Não foi possível processar os dados enviados.",
  429: "Muitas requisições. Aguarde um instante e tente novamente.",
  500: "Erro no servidor. Tente novamente em instantes.",
};

const MENSAGEM_EMAIL_EM_USO = "Este e-mail já está em uso. Tente fazer login.";
const MENSAGEM_USUARIO_EM_USO = "Este nome de usuário já está em uso. Escolha outro.";

/** Minúsculas e sem acento, para reconhecer as mensagens do backend em pt-BR e en. */
function normalizar(mensagem: string): string {
  return mensagem
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * O backend usa o mesmo status 409 para e-mail e nome de usuário já cadastrados.
 * Sem olhar o texto da mensagem, o cadastro com um username repetido acabava
 * avisando "e-mail já está cadastrado" - confuso para quem só repetiu o usuário.
 */
function mensagemDeConflito(raw: string): string | null {
  const ehConflito = /exist|cadastr|em uso|utiliz|taken|registered|already/.test(raw);
  if (!ehConflito) return null;

  if (/e-?mail/.test(raw)) return MENSAGEM_EMAIL_EM_USO;

  const mencionaUsuario = /username|user name|nome de usuario|usuario|\buser\b/.test(raw);
  if (mencionaUsuario) return MENSAGEM_USUARIO_EM_USO;

  return null;
}

export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const raw = normalizar(error.message);

    const conflito = mensagemDeConflito(raw);
    if (conflito) return conflito;

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