import { SubjectIconBadge, getSubjectColor } from "@/components/progresso_components/subject_icon";
import { resumoTrilhaMateria } from "@/components/quiz_components/trilha_resumo";
import type { TrilhaMateria } from "@/interfaces/chat_interfaces";

interface TrilhaMateriaOpcaoProps {
  materia: TrilhaMateria;
  ativa: boolean;
  onSelecionar: () => void;
}

/** Cartão branco e selecionável de uma trilha: tópicos, módulos e progresso. */
export function TrilhaMateriaOpcao({ materia, ativa, onSelecionar }: TrilhaMateriaOpcaoProps) {
  const { temas, totalModulos, modulosConcluidos, percentual } = resumoTrilhaMateria(materia);

  return (
    <button
      type="button"
      aria-pressed={ativa}
      onClick={onSelecionar}
      className={`flex flex-col gap-2 rounded-[12px] border bg-white p-3 text-left shadow-neo-raised-sm transition-[border-color,box-shadow] focus-visible:ring-4 focus-visible:ring-orange/20 focus-visible:outline-none ${
        ativa ? "border-orange" : "border-line hover:border-orange/40"
      }`}
    >
      <div className="flex w-full items-center gap-3">
        <SubjectIconBadge nome={materia.nome} materiaId={materia.id} cor={getSubjectColor(materia.id)} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[13px] font-semibold text-charcoal">{materia.nome}</p>
          <p className="text-[11px] text-gray">
            {temas} {temas === 1 ? "tópico" : "tópicos"} · {totalModulos} {totalModulos === 1 ? "módulo" : "módulos"}
          </p>
        </div>
      </div>
      <div className="flex w-full items-center gap-2">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label={`Progresso em ${materia.nome}`}
          aria-valuenow={percentual}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-orange" style={{ width: `${percentual}%` }} />
        </div>
        <span className="shrink-0 text-[11px] text-gray">
          {modulosConcluidos}/{totalModulos}
        </span>
      </div>
    </button>
  );
}
