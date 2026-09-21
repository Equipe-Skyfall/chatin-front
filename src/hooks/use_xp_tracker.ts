"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { getMeuXp, compararXp } from "@/lib/xp";

function aguardar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useXpTracker() {
  const executarComGanhoXp = useCallback(async <T,>(acao: () => Promise<T>): Promise<T> => {
    const antes = await getMeuXp().catch(() => null);
    const resultado = await acao();
    const depois = await getMeuXp().catch(() => null);

    if (antes && depois) {
      const ganho = compararXp(antes, depois);

      if (ganho.xpGanho > 0) {
        toast.success(`+${ganho.xpGanho} XP!`, {
          id: "xp-ganho",
          description: ganho.subiuDeNivel ? undefined : "Continue assim!",
        });
      }

      if (ganho.subiuDeNivel) {
        if (ganho.xpGanho > 0) await aguardar(400);

        toast.success(`🎉 Você chegou ao nível ${ganho.nivelNovo}!`, {
          id: "nivel-novo",
          duration: 5000,
        });
      }
    }

    return resultado;
  }, []);

  return { executarComGanhoXp };
}