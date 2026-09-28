export class ApiError extends Error {
  constructor(message: string, public status: number, public detail: string | null = null) {
    super(message);
    this.name = "ApiError";
  }
}

// 25s: alguns endpoints do chatin-back chamam IA (resumo, questionário,
// chat) e podem legitimamente levar perto de 15s pra responder - com o
// timeout antigo (15000ms) o AbortController do cliente cancelava bem na
// borda, disparando erro mesmo quando o servidor ia terminar com sucesso
// logo em seguida. Dá ~10s de margem sobre o pior caso observado (~15.1s)
// sem deixar uma falha real demorar quase 1min pra aparecer.
const DEFAULT_TIMEOUT_MS = 25000;
const TTL_CACHE_LEITURA_MS = 10000;
const MAX_ENTRADAS_CACHE = 100;

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export interface StudyRequestOptions extends RequestOptions {
  skipCache?: boolean;
}

function extractDetail(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const { message, detail } = data as { message?: unknown; detail?: unknown };

  if (typeof message === "string" && message) return message;
  if (typeof detail === "string" && detail) return detail;

  if (Array.isArray(detail)) {
    const mensagens = detail
      .map((item) => (item && typeof item === "object" ? (item as { msg?: unknown }).msg : null))
      .filter((msg): msg is string => typeof msg === "string" && msg.length > 0);

    if (mensagens.length) return mensagens.join(" ");
  }

  return null;
}

async function requestWithBase<T>(basePath: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${basePath}${path}`, {
      credentials: "same-origin",
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...fetchOptions.headers,
      },
    });
  } catch (error) {
    if ((error as Error | null | undefined)?.name === "AbortError") {
      throw new ApiError("Tempo de requisição esgotado", 408);
    }
    throw new ApiError("Não foi possível conectar ao servidor", 0);
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok || (data && typeof data === "object" && "success" in data && data.success === false)) {
    const detail = extractDetail(data);
    throw new ApiError(detail || "Erro na requisição", res.status, detail);
  }

  if (data === null) {
    throw new ApiError("Resposta inválida do servidor", res.status);
  }

  return data as T;
}

interface EntradaCache {
  expiraEm: number;
  valor: unknown;
}

const cacheLeituras = new Map<string, EntradaCache>();
const leiturasEmAndamento = new Map<string, Promise<unknown>>();

function cacheDisponivel(): boolean {
  return typeof window !== "undefined";
}

/** Descarta as leituras do chatin-back em cache (usado após qualquer escrita). */
export function invalidarCacheEstudo(): void {
  cacheLeituras.clear();
  leiturasEmAndamento.clear();
}

function podarCache(): void {
  const agora = Date.now();

  cacheLeituras.forEach((entrada, chave) => {
    if (entrada.expiraEm <= agora) cacheLeituras.delete(chave);
  });

  if (cacheLeituras.size >= MAX_ENTRADAS_CACHE) cacheLeituras.clear();
}

export default function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return requestWithBase<T>("/api/auth", path, options);
}

/**
 * chatin-back (via proxy autenticado). Leituras (GET) são deduplicadas enquanto
 * estão em voo e reaproveitadas por alguns segundos; escritas descartam o cache.
 */
export function studyRequest<T>(path: string, options: StudyRequestOptions = {}): Promise<T> {
  const { skipCache = false, ...rest } = options;
  const metodo = (rest.method ?? "GET").toUpperCase();

  if (metodo !== "GET") {
    const promessa = requestWithBase<T>("/api/study", path, rest);
    promessa.then(invalidarCacheEstudo, invalidarCacheEstudo);
    return promessa;
  }

  if (skipCache || !cacheDisponivel()) {
    return requestWithBase<T>("/api/study", path, rest);
  }

  const chave = `GET ${path}`;
  const emCache = cacheLeituras.get(chave);

  if (emCache && emCache.expiraEm > Date.now()) {
    return Promise.resolve(emCache.valor as T);
  }

  const pendente = leiturasEmAndamento.get(chave);
  if (pendente) return pendente as Promise<T>;

  const promessa = requestWithBase<T>("/api/study", path, rest)
    .then((valor) => {
      podarCache();
      cacheLeituras.set(chave, { expiraEm: Date.now() + TTL_CACHE_LEITURA_MS, valor });
      return valor;
    })
    .finally(() => {
      leiturasEmAndamento.delete(chave);
    });

  leiturasEmAndamento.set(chave, promessa);

  return promessa;
}
