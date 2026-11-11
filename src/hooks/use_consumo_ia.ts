"use client";

import { useCallback, useEffect, useState } from "react";
import { getConsumoIa, type ConsumoIa, type PeriodoConsumo } from "@/lib/ia_consumo";

export function useConsumoIa() {
  const [periodo, setPeriodo] = useState<PeriodoConsumo>("30");
  const [consumo, setConsumo] = useState<ConsumoIa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregar = useCallback(async (dias: PeriodoConsumo) => {
    setCarregando(true);
    setErro(false);
    try {
      setConsumo(await getConsumoIa(Number(dias)));
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao montar e ao trocar o período, padrão já usado no restante do app
    carregar(periodo);
  }, [carregar, periodo]);

  return { periodo, setPeriodo, consumo, carregando, erro, recarregar: () => carregar(periodo) };
}
