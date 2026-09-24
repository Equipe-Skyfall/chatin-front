// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { XpResumo } from "@/lib/xp";

const { getMeuXpMock, toastSuccess } = vi.hoisted(() => ({
  getMeuXpMock: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: toastSuccess } }));
vi.mock("@/lib/xp", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/xp")>()),
  getMeuXp: getMeuXpMock,
}));

import { useXpTracker } from "@/hooks/use_xp_tracker";

function xp(xp_total: number, nivel = 1): XpResumo {
  return { xp_total, nivel, xp_proximo_nivel: 100, xp_faltando_proximo_nivel: 100 - xp_total, por_materia: [] };
}

function executar<T>(acao: () => Promise<T>) {
  const { result } = renderHook(() => useXpTracker());
  return result.current.executarComGanhoXp(acao);
}

beforeEach(() => {
  getMeuXpMock.mockReset();
});

describe("useXpTracker (toast de XP no questionário)", () => {
  it("mede o XP antes e depois da ação e mostra o ganho", async () => {
    getMeuXpMock.mockResolvedValueOnce(xp(10)).mockResolvedValueOnce(xp(40));
    const acao = vi.fn().mockResolvedValue("resultado");

    await expect(executar(acao)).resolves.toBe("resultado");

    expect(acao).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("+30 XP!", expect.objectContaining({ description: "Continue assim!" }));
  });

  it("não mostra toast quando não houve ganho", async () => {
    getMeuXpMock.mockResolvedValue(xp(10));

    await executar(async () => "ok");

    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("avisa quando o aluno sobe de nível", async () => {
    getMeuXpMock.mockResolvedValueOnce(xp(90, 1)).mockResolvedValueOnce(xp(110, 2));

    await executar(async () => "ok");

    expect(toastSuccess).toHaveBeenCalledWith("+20 XP!", expect.objectContaining({ description: undefined }));
    expect(toastSuccess).toHaveBeenCalledWith("🎉 Você chegou ao nível 2!", expect.anything());
  });

  it("se a consulta de XP falhar, a ação segue normalmente e sem toast", async () => {
    getMeuXpMock.mockRejectedValue(new Error("503"));

    await expect(executar(async () => "ok")).resolves.toBe("ok");
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("propaga o erro da ação (o envio das respostas falhou)", async () => {
    getMeuXpMock.mockResolvedValue(xp(10));

    await expect(executar(async () => Promise.reject(new Error("falhou")))).rejects.toThrow("falhou");
  });
});
