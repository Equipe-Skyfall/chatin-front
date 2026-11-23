import { studyRequest } from "./api";

export interface ConsumoItem {
  chave: string;
  rotulo: string | null;
  chamadas: number;
  falhas: number;
  tokens_entrada: number;
  tokens_saida: number;
}

export interface ConsumoIa {
  periodo_dias: number;
  chamadas: number;
  falhas: number;
  tokens_entrada: number;
  tokens_saida: number;
  por_operacao: ConsumoItem[];
  por_usuario: ConsumoItem[];
}

export const PERIODOS_CONSUMO = [
  { valor: "7", label: "7 dias" },
  { valor: "30", label: "30 dias" },
  { valor: "90", label: "90 dias" },
] as const;

export type PeriodoConsumo = (typeof PERIODOS_CONSUMO)[number]["valor"];

export function getConsumoIa(dias: number): Promise<ConsumoIa> {
  return studyRequest<ConsumoIa>(`/ia/consumo?dias=${dias}`, { skipCache: true });
}

export function totalTokens(item: Pick<ConsumoItem, "tokens_entrada" | "tokens_saida">): number {
  return item.tokens_entrada + item.tokens_saida;
}
