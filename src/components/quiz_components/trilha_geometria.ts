export const NO_TAMANHO = 60;
export const NO_PASSO = 132;
export const CAMINHO_LARGURA = 340;

const DESLOCAMENTOS = [0, 70, 0, -70];

// Rótulo do módulo fica no lado oposto ao desvio da curva, pra não cruzar o traço.
export function ladoRotulo(indice: number): "esquerda" | "direita" {
  return DESLOCAMENTOS[indice % DESLOCAMENTOS.length] > 0 ? "esquerda" : "direita";
}

export interface PontoNo {
  x: number;
  y: number;
}

export function posicaoNo(indice: number): PontoNo {
  return {
    x: CAMINHO_LARGURA / 2 + DESLOCAMENTOS[indice % DESLOCAMENTOS.length],
    y: indice * NO_PASSO + NO_TAMANHO / 2 + 4,
  };
}

export function alturaCaminho(totalNos: number): number {
  return totalNos * NO_PASSO;
}

// Curva suave passando pelos `quantidade` primeiros nós da trilha.
export function tracadoCaminho(quantidade: number): string {
  if (quantidade < 2) return "";
  let d = "";
  for (let i = 0; i < quantidade; i++) {
    const { x, y } = posicaoNo(i);
    if (i === 0) {
      d += `M ${x} ${y}`;
      continue;
    }
    const anterior = posicaoNo(i - 1);
    const meio = (anterior.y + y) / 2;
    d += ` C ${anterior.x} ${meio} ${x} ${meio} ${x} ${y}`;
  }
  return d;
}

// Quantos nós o traço de progresso (laranja) deve cobrir: até o módulo
// disponível atual, ou até o último concluído quando não há módulo aberto.
export function nosAlcancados(estados: string[]): number {
  const atual = estados.findIndex((estado) => estado === "disponivel");
  if (atual >= 0) return atual + 1;
  const ultimoConcluido = estados.lastIndexOf("concluido");
  return ultimoConcluido + 1;
}
