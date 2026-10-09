"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { obterTrilha } from "@/lib/chat";
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
import type { EstadoModulo } from "@/interfaces/chat_interfaces";

export interface TemaComModulos extends Tema {
  modulos: ModuloResumo[];
}

export type EstadosPorId = Record<string, EstadoModulo>;

interface EstadosDaTrilha {
  modulos: EstadosPorId;
  temas: EstadosPorId;
}

/** O backend recusa o conteúdo de módulos que ainda não pode ler. */
function erroDeModuloBloqueado(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if ([403, 409, 422].includes(error.status)) return true;
  return (error.detail ?? "").toLowerCase().includes("bloquead");
}

/**
 * Estado de cada tópico e módulo, vindo de /trilha. Se a trilha falhar (ou não
 * incluir a matéria), devolve vazio: sem entrada, a tela não bloqueia nada por
 * conta própria e o backend continua sendo quem decide o que pode ser lido.
 */
async function carregarEstados(): Promise<EstadosDaTrilha> {
  try {
    const trilha = await obterTrilha();
    const estados: EstadosDaTrilha = { modulos: {}, temas: {} };

    for (const materia of trilha.materias) {
      for (const tema of materia.temas) {
        estados.temas[tema.id] = tema.estado;
        for (const modulo of tema.modulos) {
          estados.modulos[modulo.id] = modulo.estado;
        }
      }
    }

    return estados;
  } catch {
    return { modulos: {}, temas: {} };
  }
}

export function useMateriaLeitura(materiaId: string) {
  const [materia, setMateria] = useState<Materia | null>(null);
  const [temas, setTemas] = useState<TemaComModulos[]>([]);
  const [estadosModulos, setEstadosModulos] = useState<EstadosPorId>({});
  const [estadosTemas, setEstadosTemas] = useState<EstadosPorId>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const [moduloSelecionadoId, setModuloSelecionadoId] = useState<string | null>(null);
  const [moduloDetalhe, setModuloDetalhe] = useState<ModuloDetalhe | null>(null);
  const [carregandoModulo, setCarregandoModulo] = useState(false);
  const [moduloRecusadoId, setModuloRecusadoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(false);
    try {
      const [materiaData, temasData, estados] = await Promise.all([
        obterMateria(materiaId),
        listarTemas(materiaId),
        carregarEstados(),
      ]);

      const temasComModulos = await Promise.all(
        temasData.map(async (tema) => ({
          ...tema,
          modulos: await listarModulos(tema.id).catch(() => []),
        }))
      );

      setMateria(materiaData);
      setTemas(temasComModulos);
      setEstadosModulos(estados.modulos);
      setEstadosTemas(estados.temas);

      // Abre no módulo que o aluno deve ler agora: o primeiro ainda não concluído
      // dentre os tópicos liberados (ou o primeiro liberado, se tudo estiver concluído).
      const acessiveis = temasComModulos
        .filter((tema) => estados.temas[tema.id] !== "bloqueado")
        .flatMap((tema) => tema.modulos);
      const inicial = acessiveis.find((modulo) => estados.modulos[modulo.id] !== "concluido") ?? acessiveis[0];
      if (inicial) setModuloSelecionadoId(inicial.id);
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

  // Módulo -> "está num tópico bloqueado?". Tópico bloqueado é inacessível por inteiro.
  const moduloEmTemaBloqueado = useMemo(() => {
    const mapa: Record<string, boolean> = {};
    for (const tema of temas) {
      const bloqueado = estadosTemas[tema.id] === "bloqueado";
      for (const modulo of tema.modulos) mapa[modulo.id] = bloqueado;
    }
    return mapa;
  }, [temas, estadosTemas]);

  const selecionarModulo = useCallback(
    (moduloId: string) => {
      if (moduloEmTemaBloqueado[moduloId]) return;
      setModuloSelecionadoId(moduloId);
    },
    [moduloEmTemaBloqueado]
  );

  const moduloAcessivel = moduloSelecionadoId !== null && !moduloEmTemaBloqueado[moduloSelecionadoId];

  useEffect(() => {
    // Tópico bloqueado: nem tenta buscar o conteúdo.
    if (!moduloSelecionadoId || !moduloAcessivel) return;

    const id = moduloSelecionadoId;
    let ativo = true;

    async function carregarModulo() {
      setCarregandoModulo(true);
      try {
        const detalhe = await obterModulo(id);
        if (ativo) setModuloDetalhe(detalhe);
      } catch (error) {
        if (!ativo) return;
        if (erroDeModuloBloqueado(error)) setModuloRecusadoId(id);
        else toast.error(getFriendlyErrorMessage(error));
      } finally {
        if (ativo) setCarregandoModulo(false);
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao trocar de módulo selecionado
    carregarModulo();

    return () => {
      ativo = false;
    };
  }, [moduloSelecionadoId, moduloAcessivel]);

  const moduloBloqueado =
    moduloSelecionadoId !== null && (!moduloAcessivel || moduloRecusadoId === moduloSelecionadoId);

  return {
    materia,
    temas,
    estadosModulos,
    estadosTemas,
    carregando,
    erro,
    moduloSelecionadoId,
    selecionarModulo,
    moduloDetalhe: moduloDetalhe?.id === moduloSelecionadoId ? moduloDetalhe : null,
    carregandoModulo: carregandoModulo && !moduloBloqueado,
    moduloBloqueado,
    recarregar: carregar,
  };
}