"use client";

import { useCallback, useEffect, useState } from "react";
import { getRanking, type Ranking } from "@/lib/xp";

export const TAMANHO_INICIAL_RANKING = 20;
export const TAMANHO_EXPANDIDO_RANKING = 100;

export function useRanking() {
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [limite, setLimite] = useState(TAMANHO_INICIAL_RANKING);

  const carregar = useCallback(async (tamanho: number) => {
    setCarregando(true);
    setErro(false);
    try {
      setRanking(await getRanking(tamanho));
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao montar, padrão já usado no restante do app
    carregar(limite);
  }, [carregar, limite]);

  return {
    ranking,
    carregando,
    erro,
    podeExpandir: limite < TAMANHO_EXPANDIDO_RANKING && (ranking?.entradas.length ?? 0) >= limite,
    expandir: () => setLimite(TAMANHO_EXPANDIDO_RANKING),
    recarregar: () => carregar(limite),
  };
}
