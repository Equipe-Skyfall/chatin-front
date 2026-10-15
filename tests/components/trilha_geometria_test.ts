import { describe, expect, it } from "vitest";
import {
  CAMINHO_LARGURA,
  NO_PASSO,
  alturaCaminho,
  ladoRotulo,
  nosAlcancados,
  posicaoNo,
  tracadoCaminho,
} from "@/components/quiz_components/trilha_geometria";

describe("trilha_geometria", () => {
  describe("nosAlcancados", () => {
    it("cobre até o módulo disponível, inclusive", () => {
      expect(nosAlcancados(["concluido", "concluido", "disponivel", "bloqueado"])).toBe(3);
    });

    it("sem módulo aberto, cobre até o último concluído", () => {
      expect(nosAlcancados(["concluido", "concluido"])).toBe(2);
    });

    it("com tudo bloqueado, não cobre nenhum nó", () => {
      expect(nosAlcancados(["bloqueado", "bloqueado"])).toBe(0);
    });

    it("lista vazia não cobre nada", () => {
      expect(nosAlcancados([])).toBe(0);
    });

    it("o primeiro módulo disponível cobre só o primeiro nó", () => {
      expect(nosAlcancados(["disponivel", "bloqueado"])).toBe(1);
    });
  });

  describe("ladoRotulo", () => {
    it("fica no lado oposto ao desvio da curva", () => {
      expect(ladoRotulo(0)).toBe("direita"); // sem desvio
      expect(ladoRotulo(1)).toBe("esquerda"); // curva vai para a direita
      expect(ladoRotulo(3)).toBe("direita"); // curva vai para a esquerda
    });

    it("repete o padrão a cada 4 nós", () => {
      expect(ladoRotulo(5)).toBe(ladoRotulo(1));
    });
  });

  describe("tracadoCaminho", () => {
    it("devolve vazio com menos de 2 nós", () => {
      expect(tracadoCaminho(0)).toBe("");
      expect(tracadoCaminho(1)).toBe("");
    });

    it("começa no primeiro nó e tem uma curva por nó seguinte", () => {
      const { x, y } = posicaoNo(0);
      const d = tracadoCaminho(3);

      expect(d.startsWith(`M ${x} ${y}`)).toBe(true);
      expect(d.match(/ C /g)).toHaveLength(2);
    });
  });

  describe("posicaoNo / alturaCaminho", () => {
    it("centraliza o primeiro nó e desce um passo por nó", () => {
      expect(posicaoNo(0).x).toBe(CAMINHO_LARGURA / 2);
      expect(posicaoNo(2).y - posicaoNo(1).y).toBe(NO_PASSO);
    });

    it("altura cresce linearmente com o total de nós", () => {
      expect(alturaCaminho(0)).toBe(0);
      expect(alturaCaminho(3)).toBe(3 * NO_PASSO);
    });
  });
});
