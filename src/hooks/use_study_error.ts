"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { logout } from "@/lib/auth";
import { limparSessao, verificarSessao } from "@/hooks/use_session";
import { limparGeracoes } from "@/hooks/use_geracao_apostila";
import { limparProgressoLeitura } from "@/lib/leitura_progresso";
import { marcarIaIndisponivel } from "@/hooks/use_ia_status";
import { MENSAGEM_IA_INDISPONIVEL, ehIaIndisponivel, getStudyErrorMessage } from "@/lib/errorMessages";

interface OpcoesTratarErro {
  /** A ação que falhou depende da IA (chat, resumo, geração de conteúdo). */
  ia?: boolean;
}

export function useStudyErrorHandler() {
  const router = useRouter();

  return useCallback(
    async (error: unknown, opcoes: OpcoesTratarErro = {}) => {
      if (error instanceof ApiError && error.status === 401) {
        const sessao = await verificarSessao(true);

        if (sessao.estado === "anonimo") {
          await logout();
          limparSessao();
          limparGeracoes();
          limparProgressoLeitura();
          toast.error("Sua sessão expirou. Faça login novamente.");
          router.push("/");
          return;
        }

        toast.error("Não foi possível concluir a operação agora. Tente novamente.");
        return;
      }

      // Indisponibilidade da IA: sinaliza globalmente (faixa no header) e usa uma
      // mensagem que orienta a seguir navegando e tentar de novo depois.
      if (opcoes.ia && ehIaIndisponivel(error)) {
        marcarIaIndisponivel();
        toast.error(MENSAGEM_IA_INDISPONIVEL);
        return;
      }

      toast.error(getStudyErrorMessage(error));
    },
    [router]
  );
}
