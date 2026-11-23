"use client";

import { useEffect } from "react";
import { garantirApelidoPadrao } from "@/lib/apelido";
import { useSession } from "@/hooks/use_session";

// Usuários já verificados nesta aba: o ajuste roda uma vez por usuário, não a cada
// tela que monta a navegação.
const verificados = new Set<string>();

/** Para testes: esquece quem já foi verificado. */
export function resetarApelidoPadrao(): void {
  verificados.clear();
}

/**
 * Garante que o aluno logado tenha um apelido para o ranking: sem apelido
 * escolhido, usa o nome de usuário (ver `garantirApelidoPadrao`). Admins ficam
 * de fora, já que não entram no ranking.
 */
export function useApelidoPadrao(): void {
  const { user } = useSession();

  useEffect(() => {
    if (!user || user.role === "ADMIN" || verificados.has(user.id)) return;

    verificados.add(user.id);
    void garantirApelidoPadrao(user.username);
  }, [user]);
}
