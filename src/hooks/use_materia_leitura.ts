"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listarModulos,
  listarTemas,
  obterMateria,
  obterModulo,
  type Materia,
  type ModuloDetalhe,
  type ModuloResumo,
  type Tema,
} from "@/lib/materias";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

export interface TemaComModulos extends Tema {
  modulos: ModuloResumo[];
}

export function useMateriaLeitura(materiaId: string) {
  const [materia, setMateria] = useState<Materia | null>(null);
  const [temas, setTemas] = useState<TemaComModulos[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const [moduloSelecionadoId, setModuloSelecionadoId] = useState<string | null>(null);
  const [moduloDetalhe, setModuloDetalhe] = useState<ModuloDetalhe | null>(null);
  const [carregandoModulo, setCarregandoModulo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(false);
    try {
      const [materiaData, temasData] = await Promise.all([
        obterMateria(materiaId),
        listarTemas(materiaId),
      ]);

      const temasComModulos = await Promise.all(
        temasData.map(async (tema) => ({
          ...tema,
          modulos: await listarModulos(tema.id).catch(() => []),
        }))
      );

      setMateria(materiaData);
      setTemas(temasComModulos);

      const primeiroModulo = temasComModulos.find((t) => t.modulos.length > 0)?.modulos[0];
      if (primeiroModulo) setModuloSelecionadoId(primeiroModulo.id);
    } catch (error) {
      setErro(true);
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setCarregando(false);
    }
  }, [materiaId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao montar, padrão já usado no restante do app
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (!moduloSelecionadoId) return;
    let ativo = true;

    async function carregarModulo() {
      setCarregandoModulo(true);
      try {
        const detalhe = await obterModulo(moduloSelecionadoId!);
        if (ativo) setModuloDetalhe(detalhe);
      } catch (error) {
        if (ativo) toast.error(getFriendlyErrorMessage(error));
      } finally {
        if (ativo) setCarregandoModulo(false);
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao trocar de módulo selecionado
    carregarModulo();

    return () => {
      ativo = false;
    };
  }, [moduloSelecionadoId]);

  return {
    materia,
    temas,
    carregando,
    erro,
    moduloSelecionadoId,
    setModuloSelecionadoId,
    moduloDetalhe,
    carregandoModulo,
    recarregar: carregar,
  };
}