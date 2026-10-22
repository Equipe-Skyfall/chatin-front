"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useStudyErrorHandler } from "@/hooks/use_study_error";
import {
  estudarTrilha,
  explorarTrilhas,
  pararDeEstudarTrilha,
  removerVotoTrilha,
  TRILHAS_POR_PAGINA,
  votarTrilha,
} from "@/lib/trilhas";
import type {
  OrdemTrilha,
  OrigemTrilha,
  TrilhaExplorar,
  VotoTrilha,
} from "@/interfaces/trilha_interfaces";

export function useExplorarTrilhas() {
  const tratarErro = useStudyErrorHandler();
  const [origem, setOrigem] = useState<OrigemTrilha>("todas");
  const [ordem, setOrdem] = useState<OrdemTrilha>("votos");
  const [trilhas, setTrilhas] = useState<TrilhaExplorar[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState(false);
  const [temMais, setTemMais] = useState(false);
  const [ocupadaId, setOcupadaId] = useState<string | null>(null);
  const requisicaoRef = useRef(0);
  // Quantos itens o back já entregou: é o offset da próxima página, mesmo que
  // a lista local tenha sido ajustada (dedup) ou mude no meio do caminho.
  const consumidasRef = useRef(0);

  const carregar = useCallback(async () => {
    const requisicao = ++requisicaoRef.current;
    setCarregando(true);
    setErro(false);
    try {
      const pagina = await explorarTrilhas(origem, ordem, { limite: TRILHAS_POR_PAGINA, offset: 0 });
      if (requisicao !== requisicaoRef.current) return;
      setTrilhas(pagina);
      consumidasRef.current = pagina.length;
      setTemMais(pagina.length === TRILHAS_POR_PAGINA);
    } catch (error) {
      if (requisicao !== requisicaoRef.current) return;
      setErro(true);
      void tratarErro(error);
    } finally {
      if (requisicao === requisicaoRef.current) setCarregando(false);
    }
  }, [origem, ordem, tratarErro]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao mudar o filtro, padrão já usado no restante do app
    void carregar();
  }, [carregar]);

  const carregarMais = useCallback(async () => {
    const requisicao = requisicaoRef.current;
    setCarregandoMais(true);
    try {
      const pagina = await explorarTrilhas(origem, ordem, {
        limite: TRILHAS_POR_PAGINA,
        offset: consumidasRef.current,
      });
      if (requisicao !== requisicaoRef.current) return;
      consumidasRef.current += pagina.length;
      setTrilhas((atuais) => [...atuais, ...pagina.filter((p) => !atuais.some((a) => a.id === p.id))]);
      setTemMais(pagina.length === TRILHAS_POR_PAGINA);
    } catch (error) {
      void tratarErro(error);
    } finally {
      setCarregandoMais(false);
    }
  }, [origem, ordem, tratarErro]);

  const atualizar = useCallback((id: string, mudanca: Partial<TrilhaExplorar>) => {
    setTrilhas((atuais) => atuais.map((t) => (t.id === id ? { ...t, ...mudanca } : t)));
  }, []);

  const estudar = useCallback(
    async (trilha: TrilhaExplorar) => {
      setOcupadaId(trilha.id);
      try {
        await estudarTrilha(trilha.id);
        atualizar(trilha.id, { estudando: true, alunos: trilha.alunos + 1 });
        toast.success("Trilha adicionada às que você estuda.");
        return true;
      } catch (error) {
        void tratarErro(error);
        return false;
      } finally {
        setOcupadaId(null);
      }
    },
    [atualizar, tratarErro]
  );

  const pararDeEstudar = useCallback(
    async (trilha: TrilhaExplorar) => {
      setOcupadaId(trilha.id);
      try {
        await pararDeEstudarTrilha(trilha.id);
        atualizar(trilha.id, { estudando: false, alunos: Math.max(0, trilha.alunos - 1) });
        toast.success("Trilha removida das que você estuda.");
        return true;
      } catch (error) {
        void tratarErro(error);
        return false;
      } finally {
        setOcupadaId(null);
      }
    },
    [atualizar, tratarErro]
  );

  /** Votar de novo no mesmo sentido tira o voto. */
  const votar = useCallback(
    async (trilha: TrilhaExplorar, valor: VotoTrilha) => {
      setOcupadaId(trilha.id);
      try {
        const { votos } =
          trilha.meu_voto === valor
            ? await removerVotoTrilha(trilha.id)
            : await votarTrilha(trilha.id, valor);
        atualizar(trilha.id, { votos, meu_voto: trilha.meu_voto === valor ? null : valor });
      } catch (error) {
        void tratarErro(error);
      } finally {
        setOcupadaId(null);
      }
    },
    [atualizar, tratarErro]
  );

  return {
    origem,
    setOrigem,
    ordem,
    setOrdem,
    trilhas,
    carregando,
    carregandoMais,
    erro,
    temMais,
    ocupadaId,
    carregar,
    carregarMais,
    estudar,
    pararDeEstudar,
    votar,
  };
}
