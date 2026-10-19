"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface EstadoIa {
  /** A última operação de IA falhou por indisponibilidade do serviço. */
  indisponivel: boolean;
  /** Quando a indisponibilidade começou (para mensagens futuras/log). */
  desde: number | null;
  /** O aluno fechou o aviso; ele só volta na próxima falha. */
  dispensado: boolean;
}

const estadoInicial: EstadoIa = { indisponivel: false, desde: null, dispensado: false };

let estado: EstadoIa = estadoInicial;
const ouvintes = new Set<() => void>();

function emitir(proximo: EstadoIa): void {
  estado = proximo;
  ouvintes.forEach((ouvinte) => ouvinte());
}

function inscrever(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function ler(): EstadoIa {
  return estado;
}

function lerNoServidor(): EstadoIa {
  return estadoInicial;
}

/**
 * Marca a IA como indisponível e reexibe o aviso, mesmo que o aluno já o tenha
 * dispensado antes - uma falha nova merece ser mostrada de novo.
 */
export function marcarIaIndisponivel(): void {
  if (estado.indisponivel && !estado.dispensado) return;
  emitir({ indisponivel: true, desde: estado.desde ?? Date.now(), dispensado: false });
}

/** Volta ao normal; chamado a cada operação de IA bem-sucedida (auto-recuperação). */
export function marcarIaDisponivel(): void {
  if (!estado.indisponivel) return;
  emitir(estadoInicial);
}

/** Esconde o aviso até a próxima falha; a indisponibilidade em si continua registrada. */
export function dispensarAvisoIa(): void {
  if (!estado.indisponivel || estado.dispensado) return;
  emitir({ ...estado, dispensado: true });
}

/**
 * Estado global da IA, compartilhado entre as telas. Como é um store de módulo
 * (mesmo padrão de `use_session`), qualquer componente o lê sem precisar de um
 * provider - o aviso pode ser montado no header de todas as páginas.
 */
export function useIaStatus() {
  const atual = useSyncExternalStore(inscrever, ler, lerNoServidor);

  const dispensar = useCallback(() => dispensarAvisoIa(), []);

  return {
    indisponivel: atual.indisponivel,
    avisoVisivel: atual.indisponivel && !atual.dispensado,
    dispensar,
  };
}
