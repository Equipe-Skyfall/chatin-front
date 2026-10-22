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
import {
  desmarcarModuloConcluido,
  moduloParaRetomar,
  progressoDaMateria,
  registrarModuloAcessado,
  registrarModuloConcluido,
  type ProgressoLeituraMateria,
} from "@/lib/leitura_progresso";
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

export function useMateriaLeitura(materiaId: string, moduloInicialId: string | null = null) {
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
  const [erroModuloId, setErroModuloId] = useState<string | null>(null);
  const [tentativaModulo, setTentativaModulo] = useState(0);
  const [progressoLeitura, setProgressoLeitura] = useState<ProgressoLeituraMateria | null>(null);

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

      // Abre no módulo que o aluno deve ler agora. Prioridade: o módulo pedido na
      // URL (▶ de uma trilha) > retomar de onde parou (progresso de leitura salvo)
      // > primeiro tópico liberado ainda não concluído > primeiro liberado.
      const acessiveis = temasComModulos
        .filter((tema) => estados.temas[tema.id] !== "bloqueado")
        .flatMap((tema) => tema.modulos);
      const idsAcessiveis = acessiveis.map((modulo) => modulo.id);

      const leitura = progressoDaMateria(materiaId);

      const solicitado = moduloInicialId
        ? acessiveis.find((modulo) => modulo.id === moduloInicialId)
        : undefined;
      const retomarId = moduloParaRetomar(leitura, idsAcessiveis);
      const inicial =
        solicitado ??
        (retomarId ? acessiveis.find((modulo) => modulo.id === retomarId) : undefined) ??
        acessiveis.find((modulo) => estados.modulos[modulo.id] !== "concluido") ??
        acessiveis[0];

      if (inicial) {
        setModuloSelecionadoId(inicial.id);
        setErroModuloId(null);
        setModuloRecusadoId(null);
        setProgressoLeitura(registrarModuloAcessado(materiaId, inicial.id));
      } else {
        setProgressoLeitura(leitura);
      }
    } catch (error) {
      setErro(true);
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setCarregando(false);
    }
  }, [materiaId, moduloInicialId]);

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
      setErroModuloId(null);
      setModuloRecusadoId(null);
      setProgressoLeitura(registrarModuloAcessado(materiaId, moduloId));
    },
    [materiaId, moduloEmTemaBloqueado]
  );

  const marcarModuloLido = useCallback(
    (moduloId: string) => {
      setProgressoLeitura(registrarModuloConcluido(materiaId, moduloId));
    },
    [materiaId]
  );

  const desmarcarModuloLido = useCallback(
    (moduloId: string) => {
      setProgressoLeitura(desmarcarModuloConcluido(materiaId, moduloId));
    },
    [materiaId]
  );

  /** Nova tentativa de carregar o conteúdo que falhou (ex.: erro do backend). */
  const recarregarModulo = useCallback(() => {
    setErroModuloId(null);
    setModuloRecusadoId(null);
    setTentativaModulo((tentativa) => tentativa + 1);
  }, []);

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
        if (!ativo) return;
        setModuloDetalhe(detalhe);
        setErroModuloId(null);
        // Sucesso limpa uma recusa anterior: se o módulo voltou a ser liberado
        // (mudança de estado/novo login), a tela não fica presa em "bloqueado".
        setModuloRecusadoId(null);
      } catch (error) {
        if (!ativo) return;
        // Recusa do backend (bloqueado) vira estado próprio; qualquer outra falha
        // (ex.: um 500) vira estado de erro com "Tentar novamente" no conteúdo, em
        // vez de só um toast - a leitura não trava e o sumário continua navegável.
        if (erroDeModuloBloqueado(error)) setModuloRecusadoId(id);
        else setErroModuloId(id);
      } finally {
        if (ativo) setCarregandoModulo(false);
      }
    }

    carregarModulo();

    return () => {
      ativo = false;
    };
  }, [moduloSelecionadoId, moduloAcessivel, tentativaModulo]);

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
    erroModulo: moduloSelecionadoId !== null && erroModuloId === moduloSelecionadoId,
    recarregarModulo,
    modulosLidos: progressoLeitura?.concluidos ?? [],
    marcarModuloLido,
    desmarcarModuloLido,
    recarregar: carregar,
  };
}
