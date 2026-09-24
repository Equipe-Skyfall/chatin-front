"use client";

import { useEffect, useState } from "react";
import { useStudyErrorHandler } from "@/hooks/use_study_error";
import { obterProgresso } from "@/lib/progresso";
import type { Progresso } from "@/interfaces/progresso_interfaces";

export function useProgresso() {
  const tratarErro = useStudyErrorHandler();
  const [progresso, setProgresso] = useState<Progresso | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    obterProgresso()
      .then((dado) => {
        if (ativo) setProgresso(dado);
      })
      .catch((error) => {
        if (ativo) tratarErro(error);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [tratarErro]);

  return { progresso, carregando };
}
