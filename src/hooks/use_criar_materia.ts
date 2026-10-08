"use client";

import { useEffect, useRef, useState } from "react";
import {
  criarMateria,
  criarTema,
  gerarModulosAutomaticamente,
  obterStatusTema,
  type TemaStatus,
} from "@/lib/materias";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

const POLL_INTERVAL_MS = 3000;

export type EtapaCriacao = "formulario" | "criando" | "gerando" | "pronto" | "erro";

export function useCriarMateria(onConcluida: (materiaId: string) => void) {
  const [etapa, setEtapa] = useState<EtapaCriacao>("formulario");
  const [progresso, setProgresso] = useState<TemaStatus | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const materiaIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pararPolling() {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => {
    return () => pararPolling();
  }, []);

  async function pollStatus(temaId: string) {
    try {
      const status = await obterStatusTema(temaId);
      setProgresso(status);

      if (status.pronto_para_estudar) {
        setEtapa("pronto");
        pararPolling();
        if (materiaIdRef.current) onConcluida(materiaIdRef.current);
        return;
      }

      const semProgresso =
        status.modulos_com_erro > 0 && status.modulos_gerando === 0 && status.modulos_prontos === 0;

      if (semProgresso) {
        setEtapa("erro");
        setErro("Não foi possível gerar o conteúdo dessa apostila. Tente novamente.");
        pararPolling();
        return;
      }

      pollRef.current = setTimeout(() => pollStatus(temaId), POLL_INTERVAL_MS);
    } catch (error) {
      setEtapa("erro");
      setErro(getFriendlyErrorMessage(error));
    }
  }

  async function criar(dados: { nome: string; descricao: string; titulo: string; direcionamento: string }) {
    setEtapa("criando");
    setErro(null);
    try {
      const materia = await criarMateria({ nome: dados.nome, descricao: dados.descricao });
      materiaIdRef.current = materia.id;

      const tema = await criarTema(materia.id, {
        titulo: dados.titulo,
        descricao: dados.descricao,
        direcionamento: dados.direcionamento,
      });

      setEtapa("gerando");
      await gerarModulosAutomaticamente(tema.id);
      pollStatus(tema.id);
    } catch (error) {
      setEtapa("erro");
      setErro(getFriendlyErrorMessage(error));
    }
  }

  function reiniciar() {
    pararPolling();
    setEtapa("formulario");
    setProgresso(null);
    setErro(null);
    materiaIdRef.current = null;
  }

  return { etapa, progresso, erro, criar, reiniciar };
}