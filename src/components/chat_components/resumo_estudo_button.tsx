"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { gerarResumo } from "@/lib/resumos";
import { useStudyErrorHandler } from "@/hooks/use_study_error";

interface ResumoEstudoButtonProps {
  conversaId: string;
}

export function ResumoEstudoButton({ conversaId }: ResumoEstudoButtonProps) {
  const router = useRouter();
  const tratarErro = useStudyErrorHandler();
  const [gerando, setGerando] = useState(false);

  async function gerar() {
    setGerando(true);
    try {
      await gerarResumo(conversaId);
      toast.success("Resumo de estudo salvo na Biblioteca.");
      router.push("/biblioteca");
    } catch (error) {
      tratarErro(error);
    } finally {
      setGerando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={gerar}
      disabled={gerando}
      className="flex items-center gap-1.5 rounded-[9px] border border-orange px-3 py-1.5 text-[12px] font-semibold text-orange transition-colors hover:bg-orange/10 disabled:opacity-60"
    >
      <NotebookPen size={14} />
      {gerando ? "Gerando resumo..." : "Gerar resumo de estudo"}
    </button>
  );
}
