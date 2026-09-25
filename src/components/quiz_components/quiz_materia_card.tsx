import { ChevronRight } from "lucide-react";
import { SubjectIconBadge } from "@/components/progresso_components/subject_icon";
import { estadoBadgeClass, estadoLabel } from "@/lib/progresso";
import { resumoTrilhaMateria } from "@/components/quiz_components/trilha_resumo";
import type { TrilhaMateria } from "@/schemas/quiz";

const ORANGE = "#f2711c";

interface QuizMateriaCardProps {
  materia: TrilhaMateria;
  onAbrir: () => void;
}

export function QuizMateriaCard({ materia, onAbrir }: QuizMateriaCardProps) {
  const { temas, totalModulos, modulosConcluidos, estado } = resumoTrilhaMateria(materia);

  return (
    <button
      type="button"
      onClick={onAbrir}
      className="group flex w-full flex-col gap-3 rounded-[12px] border border-line bg-white p-4 text-left shadow-neo-raised-sm transition hover:-translate-y-0.5 hover:border-orange/40 hover:shadow-neo-raised focus-visible:ring-4 focus-visible:ring-orange/20 focus-visible:outline-none"
    >
      <div className="flex items-start gap-3">
        <SubjectIconBadge nome={materia.nome} materiaId={materia.id} cor={ORANGE} size={36} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-sm font-semibold text-charcoal">{materia.nome}</h3>
          <p className="mt-0.5 text-[11px] text-gray">
            {temas} {temas === 1 ? "tópico" : "tópicos"} · {totalModulos} {totalModulos === 1 ? "módulo" : "módulos"}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${estadoBadgeClass(estado)}`}>
          {estadoLabel(estado)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-3">
        <span className="text-[11px] text-gray">
          {modulosConcluidos} de {totalModulos} módulos concluídos
        </span>
        <ChevronRight
          size={16}
          className="text-gray transition group-hover:translate-x-0.5 group-hover:text-orange"
        />
      </div>
    </button>
  );
}
