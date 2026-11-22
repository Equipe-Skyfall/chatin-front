// Revisões de resumos da Biblioteca, guardadas no navegador do aluno.
//
// O backend não registra a abertura de um resumo - o `GET /resumos/{id}` só
// devolve o conteúdo. Como no progresso de leitura (ver `leitura_progresso.ts`),
// esse acompanhamento "quantos resumos eu já revisei" vive no `localStorage`.
// Cada abertura conta uma revisão: reabrir o mesmo resumo conta de novo, e
// baixar o PDF (que não passa por aqui) não conta.

const CHAVE_STORAGE = "chatin:resumos-revisao";

export interface RevisaoResumo {
  resumoId: string;
  /** Quantas vezes este resumo foi aberto. */
  vezes: number;
  /** Última abertura, em ISO. */
  ultimaEm: string;
}

export interface RevisoesResumos {
  /** Total de aberturas desde o início (reabrir conta de novo). */
  total: number;
  /** Aberturas por resumo. */
  porResumo: Record<string, RevisaoResumo>;
  atualizadoEm: string;
}

function vazio(): RevisoesResumos {
  return { total: 0, porResumo: {}, atualizadoEm: "" };
}

function storageDisponivel(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Estado salvo por completo; tolera JSON corrompido devolvendo vazio. */
export function lerRevisoes(): RevisoesResumos {
  if (!storageDisponivel()) return vazio();

  try {
    const bruto = window.localStorage.getItem(CHAVE_STORAGE);
    if (!bruto) return vazio();

    const dados: unknown = JSON.parse(bruto);
    if (!dados || typeof dados !== "object") return vazio();

    const { total, porResumo, atualizadoEm } = dados as Partial<RevisoesResumos>;
    return {
      total: typeof total === "number" ? total : 0,
      porResumo: porResumo && typeof porResumo === "object" ? porResumo : {},
      atualizadoEm: typeof atualizadoEm === "string" ? atualizadoEm : "",
    };
  } catch {
    return vazio();
  }
}

function salvarRevisoes(estado: RevisoesResumos): void {
  if (!storageDisponivel()) return;

  try {
    window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
  } catch {
    // Storage cheio/indisponível (modo privado): o app segue, só não persiste.
  }
}

/**
 * Registra a abertura de um resumo da Biblioteca. Cada chamada soma uma revisão
 * ao total e ao contador do próprio resumo - reabrir o mesmo resumo conta de novo.
 */
export function registrarRevisao(resumoId: string): RevisoesResumos {
  const atual = lerRevisoes();
  const agora = new Date().toISOString();
  const anterior = atual.porResumo[resumoId];

  const proximo: RevisoesResumos = {
    total: atual.total + 1,
    porResumo: {
      ...atual.porResumo,
      [resumoId]: {
        resumoId,
        vezes: (anterior?.vezes ?? 0) + 1,
        ultimaEm: agora,
      },
    },
    atualizadoEm: agora,
  };

  salvarRevisoes(proximo);
  return proximo;
}

/** Total de revisões registradas (aberturas de resumos), para a tela de Progresso. */
export function contarRevisoes(): number {
  return lerRevisoes().total;
}

/** Quantas vezes um resumo específico foi revisado. */
export function revisoesDoResumo(resumoId: string): number {
  return lerRevisoes().porResumo[resumoId]?.vezes ?? 0;
}

export function limparRevisoes(): void {
  if (!storageDisponivel()) return;

  try {
    window.localStorage.removeItem(CHAVE_STORAGE);
  } catch {
    // Sem storage não há o que limpar.
  }
}
