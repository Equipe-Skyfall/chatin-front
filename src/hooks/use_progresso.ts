"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getMeuProgresso, type MateriaProgresso } from "@/lib/progresso";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

export function useProgresso() {
  const [materias, setMaterias] = useState<MateriaProgresso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [materiaSelecionadaId, setMateriaSelecionadaId] = useState<string | null>(null);
  const [temaAbertoId, setTemaAbertoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(false);
    try {
      const resumo = await getMeuProgresso();
      setMaterias(resumo.materias);
    } catch (error) {
      setErro(true);
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao montar, padrão já usado no restante do app
    carregar();
  }, [carregar]);

  function abrirMateria(materiaId: string) {
    setMateriaSelecionadaId(materiaId);
    setTemaAbertoId(null);
  }

  function fecharMateria() {
    setMateriaSelecionadaId(null);
    setTemaAbertoId(null);
  }

  function alternarTema(temaId: string) {
    setTemaAbertoId((atual) => (atual === temaId ? null : temaId));
  }

  const materiaSelecionada = materias.find((m) => m.materia_id === materiaSelecionadaId) ?? null;

  return {
    materias,
    carregando,
    erro,
    materiaSelecionada,
    temaAbertoId,
    abrirMateria,
    fecharMateria,
    alternarTema,
    recarregar: carregar,
  };
}