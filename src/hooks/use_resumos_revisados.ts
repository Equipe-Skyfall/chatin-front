"use client";

import { useEffect, useState } from "react";
import { contarRevisoes } from "@/lib/resumos_revisao";

/**
 * Total de revisões de resumos da Biblioteca. Lê o `localStorage` no mount (ver
 * `lib/resumos_revisao.ts`) - como o registro acontece na própria navegação, o
 * número já vem atualizado ao abrir a tela de Progresso.
 */
export function useResumosRevisados(): number {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura do storage ao montar, padrão já usado no restante do app
    setTotal(contarRevisoes());
  }, []);

  return total;
}
