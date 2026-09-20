"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { logout } from "@/lib/auth";
import { limparSessao, verificarSessao } from "@/hooks/use_session";
import { getStudyErrorMessage } from "@/lib/errorMessages";

export function useStudyErrorHandler() {
  const router = useRouter();

  return useCallback(
    async (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        const sessao = await verificarSessao(true);

        if (sessao.estado === "anonimo") {
          await logout();
          limparSessao();
          toast.error("Sua sessão expirou. Faça login novamente.");
          router.push("/");
          return;
        }

        toast.error("Não foi possível concluir a operação agora. Tente novamente.");
        return;
      }

      toast.error(getStudyErrorMessage(error));
    },
    [router]
  );
}
