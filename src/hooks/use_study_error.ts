"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { logout } from "@/lib/auth";
import { getStudyErrorMessage } from "@/lib/errorMessages";

export function useStudyErrorHandler() {
  const router = useRouter();

  return useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        toast.error("Sua sessão expirou. Faça login novamente.");
        router.push("/");
        return;
      }

      toast.error(getStudyErrorMessage(error));
    },
    [router]
  );
}
