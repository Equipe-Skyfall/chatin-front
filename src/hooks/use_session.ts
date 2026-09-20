"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { getSession, type SessionUser, type UserRole } from "@/lib/auth";

export type EstadoSessao = "carregando" | "autenticado" | "anonimo" | "indisponivel";

export interface SnapshotSessao {
  user: SessionUser | null;
  estado: EstadoSessao;
}

const snapshotInicial: SnapshotSessao = { user: null, estado: "carregando" };

let snapshot: SnapshotSessao = snapshotInicial;
let buscaEmAndamento: Promise<SnapshotSessao> | null = null;
const ouvintes = new Set<() => void>();

function emitir(proximo: SnapshotSessao): void {
  snapshot = proximo;
  ouvintes.forEach((ouvinte) => ouvinte());
}

function inscrever(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function ler(): SnapshotSessao {
  return snapshot;
}

function lerNoServidor(): SnapshotSessao {
  return snapshotInicial;
}

/**
 * Busca a sessão uma única vez por página: chamadas concorrentes de `useSession`
 * reaproveitam a mesma requisição em vez de disparar uma por componente.
 */
export async function verificarSessao(forcar = false): Promise<SnapshotSessao> {
  if (buscaEmAndamento) {
    if (!forcar) return buscaEmAndamento;
    await buscaEmAndamento;
  }

  buscaEmAndamento = (async () => {
    try {
      const user = await getSession();
      emitir(user ? { user, estado: "autenticado" } : { user: null, estado: "anonimo" });
    } catch {
      emitir({ user: snapshot.user, estado: "indisponivel" });
    }

    buscaEmAndamento = null;
    return snapshot;
  })();

  return buscaEmAndamento;
}

export function limparSessao(): void {
  emitir({ user: null, estado: "carregando" });
}

export function useSession() {
  const atual = useSyncExternalStore(inscrever, ler, lerNoServidor);

  useEffect(() => {
    if (atual.estado === "carregando") void verificarSessao();
  }, [atual.estado]);

  const recarregar = useCallback(() => verificarSessao(true), []);

  const role: UserRole | null = atual.user?.role ?? null;

  return {
    user: atual.user,
    role,
    carregando: atual.estado === "carregando",
    indisponivel: atual.estado === "indisponivel",
    recarregar,
  };
}
