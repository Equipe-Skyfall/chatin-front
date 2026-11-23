import { studyRequest } from "./api";

export const APELIDO_MIN = 3;
export const APELIDO_MAX = 20;

export interface ApelidoResposta {
  apelido: string | null;
}

export function getApelido(): Promise<ApelidoResposta> {
  return studyRequest<ApelidoResposta>("/perfil/apelido", { skipCache: true });
}

export function definirApelido(apelido: string): Promise<ApelidoResposta> {
  return studyRequest<ApelidoResposta>("/perfil/apelido", {
    method: "PATCH",
    body: JSON.stringify({ apelido }),
  });
}

/** Mesma regra do back: 3 a 20 caracteres de letras, números, espaço, ponto, hífen ou sublinhado. */
export function apelidoValido(apelido: string): boolean {
  const limpo = apelido.trim().replace(/\s+/g, " ");
  return limpo.length >= APELIDO_MIN && limpo.length <= APELIDO_MAX && /^[\p{L}\p{N}_.\- ]+$/u.test(limpo);
}

/**
 * Se o aluno ainda não escolheu um apelido, usa o nome de usuário dele, para o
 * ranking não mostrar o nome neutro ("Aluno K3F9"). Não sobrescreve um apelido já
 * escolhido. Quando o nome de usuário não serve como apelido (fora de 3 a 20
 * caracteres) ou já é o apelido de outro aluno (409), não faz nada: o aluno
 * continua podendo escolher no Perfil. Nunca lança erro - é um ajuste silencioso.
 */
export async function garantirApelidoPadrao(username: string): Promise<string | null> {
  try {
    const { apelido } = await getApelido();
    if (apelido) return apelido;

    const candidato = username.trim();
    if (!apelidoValido(candidato)) return null;

    return (await definirApelido(candidato)).apelido;
  } catch {
    return null;
  }
}
