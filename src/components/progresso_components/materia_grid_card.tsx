import { ChevronRight } from "lucide-react";
import { CircularProgress } from "./circular_progress";
import { SubjectIconBadge } from "./subject_icon";
import { estadoBadgeClass, estadoLabel, type MateriaProgresso } from "@/lib/progresso";

interface MateriaGridCardProps {
  materia: MateriaProgresso;
  cor: string;
  onAbrir: () => void;
}

export function MateriaGridCard({ materia, cor, onAbrir }: MateriaGridCardProps) {
  return (
    <button
      type="button"
      onClick={onAbrir}
className="group relative flex flex-col overflow-hidden rounded-[16px] bg-surface text-left shadow-neo-raised transition hover:-translate-y-1 hover:shadow-lg"    >
      <div className="h-1.5 w-full" style={{ backgroundColor: cor }} />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <SubjectIconBadge nome={materia.nome} materiaId={materia.materia_id} cor={cor} size={44} />
            <div className="min-w-0">
              <h3 className="truncate font-display text-[15px] font-semibold text-charcoal">{materia.nome}</h3>
              <p className="mt-0.5 text-[11.5px] text-gray">
                {materia.temas.length} {materia.temas.length === 1 ? "tópico" : "tópicos"} · {materia.xp} XP
              </p>
            </div>
          </div>

          <div className="relative flex size-12 shrink-0 items-center justify-center">
            <CircularProgress percent={materia.percentual_completo} size={48} strokeWidth={5} color={cor} />
            <span className="absolute font-display text-[11px] font-bold text-charcoal">
              {materia.percentual_completo}%
            </span>
          </div>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${materia.percentual_completo}%`, backgroundColor: cor }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className={`w-fit rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${estadoBadgeClass(materia.estado)}`}>
            {estadoLabel(materia.estado)}
          </span>
          <span className="flex items-center gap-1 text-[11.5px] font-medium text-gray transition group-hover:text-orange">
            Ver detalhes
            <ChevronRight size={14} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
}