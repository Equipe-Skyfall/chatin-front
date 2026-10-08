import { BookMarked, ThumbsUp } from "lucide-react";
import { SubjectIconBadge, getSubjectColor } from "@/components/progresso_components/subject_icon";
import type { Materia } from "@/lib/materias";

interface MateriaCardProps {
  materia: Materia;
  onAbrir: () => void;
}

export function MateriaCard({ materia, onAbrir }: MateriaCardProps) {
  const cor = getSubjectColor(materia.id);

  return (
    <button
      type="button"
      onClick={onAbrir}
      className="group flex flex-col gap-3 rounded-[14px] border border-line bg-white p-4 text-left shadow-neo-raised-sm transition hover:-translate-y-0.5 hover:shadow-neo-raised"
    >
      <div className="flex items-start gap-3">
        <SubjectIconBadge nome={materia.nome} materiaId={materia.id} cor={cor} size={40} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[14.5px] font-semibold text-charcoal">{materia.nome}</h3>
          <p className="mt-0.5 line-clamp-2 text-[11.5px] text-gray">{materia.descricao}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-2.5">
        <span className="flex items-center gap-1 text-[11px] text-gray">
          <ThumbsUp size={12} /> {materia.votos}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-medium text-gray transition group-hover:text-orange">
          <BookMarked size={13} /> Ler apostila
        </span>
      </div>
    </button>
  );
}