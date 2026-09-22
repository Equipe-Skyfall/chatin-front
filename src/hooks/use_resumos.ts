"use client";

import { useCallback, useEffect, useState } from "react";
import { useStudyErrorHandler } from "@/hooks/use_study_error";
import { LIMITE_RESUMOS_PAGINA, listarResumos, obterResumo } from "@/lib/resumos";
import type { ResumoEstudo, ResumoEstudoListItem } from "@/interfaces/resumo_interfaces";

export function useResumos() {
  const tratarErro = useStudyErrorHandler();
  const [resumos, setResumos] = useState<ResumoEstudoListItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMais, setTemMais] = useState(false);
  const [resumoAberto, setResumoAberto] = useState<ResumoEstudo | null>(null);

  useEffect(() => {
    let ativo = true;

    listarResumos({ limit: LIMITE_RESUMOS_PAGINA, offset: 0 })
      .then((lista) => {
        if (!ativo) return;
        setResumos(lista);
        setTemMais(lista.length === LIMITE_RESUMOS_PAGINA);
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

  const carregarMais = useCallback(async () => {
    setCarregandoMais(true);
    try {
      const lista = await listarResumos({
        limit: LIMITE_RESUMOS_PAGINA,
        offset: resumos.length,
      });
      setResumos((atuais) => [...atuais, ...lista]);
      setTemMais(lista.length === LIMITE_RESUMOS_PAGINA);
    } catch (error) {
      tratarErro(error);
    } finally {
      setCarregandoMais(false);
    }
  }, [resumos.length, tratarErro]);

  const abrir = useCallback(
    async (id: string) => {
      try {
        setResumoAberto(await obterResumo(id));
      } catch (error) {
        tratarErro(error);
      }
    },
    [tratarErro]
  );

  const fechar = useCallback(() => setResumoAberto(null), []);

  return {
    resumos,
    carregando,
    carregandoMais,
    temMais,
    resumoAberto,
    carregarMais,
    abrir,
    fechar,
  };
}
