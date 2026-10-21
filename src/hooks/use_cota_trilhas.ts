"use client";

import { useCallback, useEffect, useState } from "react";
import { obterCotaTrilhas } from "@/lib/trilhas";
import type { CotaTrilhas } from "@/interfaces/trilha_interfaces";

/** A cota é um complemento da tela: se falhar, o resto segue funcionando e o
 * back ainda barra a criação acima do limite. */
export function useCotaTrilhas() {
  const [cota, setCota] = useState<CotaTrilhas | null>(null);

  const recarregar = useCallback(async () => {
    try {
      setCota(await obterCotaTrilhas());
    } catch {
      setCota(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao montar, padrão já usado no restante do app
    void recarregar();
  }, [recarregar]);

  const esgotada = cota !== null && cota.restantes !== null && cota.restantes === 0;

  return { cota, esgotada, recarregar };
}
