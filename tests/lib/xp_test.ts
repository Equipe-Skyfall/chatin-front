import { describe, expect, it } from "vitest";
import { calcularProgressoNivel, compararXp, type XpResumo } from "@/lib/xp";

function xp(parcial: Partial<XpResumo>): XpResumo {
  return {
    xp_total: 0,
    nivel: 1,
    xp_proximo_nivel: 100,
    xp_faltando_proximo_nivel: 100,
    por_materia: [],
    ...parcial,
  };
}

describe("calcularProgressoNivel (barra de XP)", () => {
  it("calcula a porcentagem arredondada", () => {
    expect(calcularProgressoNivel(xp({ xp_total: 50, xp_proximo_nivel: 100 }))).toBe(50);
    expect(calcularProgressoNivel(xp({ xp_total: 1, xp_proximo_nivel: 3 }))).toBe(33);
    expect(calcularProgressoNivel(xp({ xp_total: 2, xp_proximo_nivel: 3 }))).toBe(67);
  });

  it("limita o resultado entre 0 e 100", () => {
    expect(calcularProgressoNivel(xp({ xp_total: 250, xp_proximo_nivel: 100 }))).toBe(100);
    expect(calcularProgressoNivel(xp({ xp_total: -10, xp_proximo_nivel: 100 }))).toBe(0);
  });

  it("retorna 0 quando o próximo nível é 0 ou negativo (evita divisão por zero)", () => {
    expect(calcularProgressoNivel(xp({ xp_total: 10, xp_proximo_nivel: 0 }))).toBe(0);
    expect(calcularProgressoNivel(xp({ xp_total: 10, xp_proximo_nivel: -5 }))).toBe(0);
  });
});

describe("compararXp (toast de XP ganho)", () => {
  it("calcula o XP ganho sem subir de nível", () => {
    expect(compararXp(xp({ xp_total: 40, nivel: 2 }), xp({ xp_total: 70, nivel: 2 }))).toEqual({
      xpGanho: 30,
      subiuDeNivel: false,
      nivelAnterior: 2,
      nivelNovo: 2,
    });
  });

  it("detecta subida de nível", () => {
    const ganho = compararXp(xp({ xp_total: 90, nivel: 1 }), xp({ xp_total: 120, nivel: 2 }));
    expect(ganho.subiuDeNivel).toBe(true);
    expect(ganho.nivelNovo).toBe(2);
  });

  it("nunca informa XP ganho negativo", () => {
    expect(compararXp(xp({ xp_total: 100 }), xp({ xp_total: 80 })).xpGanho).toBe(0);
  });
});
