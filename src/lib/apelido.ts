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
