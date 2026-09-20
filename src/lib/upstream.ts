export const AUTH_API_URL = process.env.AUTH_API_URL;
export const STUDY_API_URL = process.env.STUDY_API_URL;

export interface UpstreamResponse<T> {
  ok: boolean;
  status: number;
  data: T | null;
}

export async function upstreamJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<UpstreamResponse<T>> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as T | null;

  return { ok: res.ok, status: res.status, data };
}

export function reportUpstreamFailure(service: string, error: unknown): void {
  const cause = error instanceof Error ? (error as Error & { cause?: unknown }).cause : undefined;
  console.error(`[upstream:${service}] requisição falhou`, { error, cause });
}
