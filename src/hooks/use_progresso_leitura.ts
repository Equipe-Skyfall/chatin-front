"use client";

import { useEffect, useState } from "react";

/**
 * Progresso de rolagem da página (0-100). Também volta ao topo quando a chave
 * muda (ex.: troca de módulo), para cada módulo começar na primeira linha.
 */
export function useProgressoLeitura(chave: string | null): number {
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0 });

    function atualizar() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgresso(total <= 0 ? 0 : Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
    }

    const frame = requestAnimationFrame(atualizar);
    window.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
    };
  }, [chave]);

  return progresso;
}
