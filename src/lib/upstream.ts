export const AUTH_API_URL = process.env.AUTH_API_URL;
export const STUDY_API_URL = process.env.STUDY_API_URL;

const TIMEOUT_MS = 15000;

/** fetch com timeout - nenhuma chamada ao serviço de auth externo pode
 * travar pra sempre; sem isso, uma instabilidade lá deixava o usuário
 * preso num spinner infinito (login, sessão, perfil, troca de senha...).
 * Os route handlers de auth já tratam qualquer erro de fetch (try/catch
 * -> 503), então o AbortError do timeout cai no mesmo caminho sem
 * precisar de tratamento especial. */
export async function fetchComTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function reportUpstreamFailure(service: string, error: unknown): void {
  const cause = error instanceof Error ? (error as Error & { cause?: unknown }).cause : undefined;
  console.error(`[upstream:${service}] requisição falhou`, { error, cause });
}
