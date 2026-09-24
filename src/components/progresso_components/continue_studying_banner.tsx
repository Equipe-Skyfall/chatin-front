import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { getSubjectIcon } from "./subject_icon";
import type { MateriaProgresso } from "@/lib/progresso";

interface ContinueStudyingBannerProps {
  materia: MateriaProgresso;
  cor: string;
  onContinuar: () => void;
}

export function ContinueStudyingBanner({ materia, cor, onContinuar }: ContinueStudyingBannerProps) {
  const Icon = useMemo(
    () => getSubjectIcon(materia.nome, materia.materia_id),
    [materia.nome, materia.materia_id]
  );

  return (
    <div
      className="relative overflow-hidden rounded-[18px] p-5 sm:p-6"
      style={{ background: `linear-gradient(135deg, ${cor} 0%, ${cor}cc 100%)` }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 right-16 size-28 rounded-full bg-white/10" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            {/* eslint-disable-next-line react-hooks/static-components -- Icon referencia um componente fixo do lucide-react, escolhido deterministicamente por getSubjectIcon; nenhum componente novo é criado aqui */}
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">Continue estudando</p>
            <h3 className="font-display text-[17px] font-bold text-white">{materia.nome}</h3>
            <p className="text-[12px] text-white/85">
              {materia.percentual_completo}% concluído · {materia.xp} XP
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinuar}
          className="flex items-center justify-center gap-1.5 rounded-[10px] bg-white px-4 py-2.5 text-[13px] font-semibold transition hover:bg-white/90 sm:shrink-0"
          style={{ color: cor }}
        >
          Continuar
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/25">
        <div className="h-full rounded-full bg-white transition-all" style={{ width: `${materia.percentual_completo}%` }} />
      </div>
    </div>
  );
}