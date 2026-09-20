"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession, type SessionUser, type UserRole } from "@/lib/auth";

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    const sessao = await getSession();
    setUser(sessao);
    setCarregando(false);
    return sessao;
  }, []);

  useEffect(() => {
    let ativo = true;

    getSession()
      .then((sessao) => {
        if (ativo) setUser(sessao);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const role: UserRole | null = user?.role ?? null;

  return { user, role, carregando, recarregar };
}
