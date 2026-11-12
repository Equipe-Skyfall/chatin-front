"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getConsumoIa, type ConsumoIa, type PeriodoConsumo } from "@/lib/ia_consumo";

export function useConsumoIa() {
  const [periodo, setPeriodo] = useState<PeriodoConsumo>("30");
  const [consumo, setConsumo] = useState<ConsumoIa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  // Só a chamada mais recente atualiza o estado; trocar o período rápido não deixa resposta antiga sobrescrever.
  const ultima = useRef(0);

  const carregar = useCallback(async (dias: PeriodoConsumo) => {
    const id = ++ultima.current;
    setCarregando(true);
    setErro(false);
    try {
      const resposta = await getConsumoIa(Number(dias));
      if (id === ultima.current) setConsumo(resposta);
    } catch {
      if (id === ultima.current) setErro(true);
    } finally {
      if (id === ultima.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao montar e ao trocar o período, padrão já usado no restante do app
    carregar(periodo);
  }, [carregar, periodo]);

  return { periodo, setPeriodo, consumo, carregando, erro, recarregar: () => carregar(periodo) };
}
