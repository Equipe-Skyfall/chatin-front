import { ApiError } from "./api";

export const CODIGO_LICAO_NAO_INICIADA = "LICAO_NAO_INICIADA";

/** Rota do chat do módulo com o botão "Começar lição". */
export function rotaComecarLicao(moduloId: string): string {
  return `/chat?modulo=${encodeURIComponent(moduloId)}&comecar=1`;
}

/**
 * Se o erro é o bloqueio do quiz por falta da lição, devolve o módulo a
 * estudar (o do erro, ou `moduloIdPadrao`); senão, null.
 */
export function moduloDaLicaoPendente(erro: unknown, moduloIdPadrao: string): string | null {
  if (!(erro instanceof ApiError) || erro.code !== CODIGO_LICAO_NAO_INICIADA) return null;

  const doErro = erro.dados?.modulo_id;
  return typeof doErro === "string" && doErro ? doErro : moduloIdPadrao;
}
