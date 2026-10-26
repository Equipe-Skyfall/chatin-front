"use client";

import { useEffect, useState } from "react";
import { LIMITE_RECOMENDACOES, listarRecomendacoes } from "@/lib/recomendacoes";
import type { Recomendacao } from "@/interfaces/recomendacao_interfaces";

/**
 * Sugestões de estudo do Início, da mais urgente para a menos. É um complemento
 * da tela: se falhar, o resto continua funcionando sem o tip e nenhum toast é
 * disparado.
 */
export function useRecomendacao(limite = LIMITE_RECOMENDACOES) {
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    listarRecomendacoes(limite)
      .then((resposta) => {
        if (ativo) setRecomendacoes(resposta.recomendacoes);
      })
      .catch(() => undefined)
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [limite]);

  return { recomendacoes, carregando };
}
