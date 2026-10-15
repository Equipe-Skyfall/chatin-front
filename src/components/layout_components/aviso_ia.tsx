"use client";

import { TriangleAlert, X } from "lucide-react";
import { MENSAGEM_IA_INDISPONIVEL } from "@/lib/errorMessages";
import { useIaStatus } from "@/hooks/use_ia_status";

/** Aviso de indisponibilidade da IA: uma faixa fina e dispensável que não cobre
 * o conteúdo nem bloqueia a navegação - o aluno segue usando o resto do sistema
 * e é orientado a tentar de novo depois. */
export function AvisoIa() {
  const { avisoVisivel, dispensar } = useIaStatus();

  if (!avisoVisivel) return null;

  return (
    <div
      role="status"
      className="flex shrink-0 items-center gap-2 border-b border-error/30 bg-error/10 px-4 py-2 text-[12px] text-error-ink sm:px-7"
    >
      <TriangleAlert size={15} className="shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">{MENSAGEM_IA_INDISPONIVEL}</p>
      <button
        type="button"
        onClick={dispensar}
        aria-label="Fechar aviso de indisponibilidade da IA"
        className="shrink-0 rounded-md p-1 transition-colors hover:bg-error/15 focus-visible:ring-2 focus-visible:ring-error/40 focus-visible:outline-none"
      >
        <X size={14} />
      </button>
    </div>
  );
}
