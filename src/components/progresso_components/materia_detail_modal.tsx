import { X } from "lucide-react";
import { CircularProgress } from "./circular_progress";
import { TemaTimelineItem } from "./tema_timeline_item";
import type { MateriaProgresso } from "@/lib/progresso";

interface MateriaDetailModalProps {
  materia: MateriaProgresso | null;
  cor: string;
  temaAbertoId: string | null;
  onToggleTema: (temaId: string) => void;
  onClose: () => void;
  onAbrirModulo?: (moduloId: string, titulo: string) => void;
}

export function MateriaDetailModal({
  materia,
  cor,
  temaAbertoId,
  onToggleTema,
  onClose,
  onAbrirModulo,
}: MateriaDetailModalProps) {
  if (!materia) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8" onClick={onClose}>
      <div
  role="dialog"
  aria-modal="true"
  aria-labelledby="materia-detail-title"
  className="flex max-h-full w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl"
  onClick={(e) => e.stopPropagation()}
>
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div className="flex items-center gap-3">
            <div className="relative flex size-14 shrink-0 items-center justify-center">
              <CircularProgress percent={materia.percentual_completo} size={56} strokeWidth={5} color={cor} />
              <span className="absolute font-display text-[12px] font-bold text-charcoal">
                {materia.percentual_completo}%
              </span>
            </div>
            <div>
              <h2 className="font-display text-[16px] font-semibold text-charcoal" id="materia-detail-title">
                {materia.nome}
              </h2>
              <p className="text-[12px] text-gray">{materia.xp} XP acumulado</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray hover:text-charcoal" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {materia.temas.length === 0 ? (
            <p className="text-[13px] text-gray">Nenhum tópico cadastrado nesta matéria.</p>
          ) : (
            materia.temas.map((tema, index) => (
              <TemaTimelineItem
                key={tema.tema_id}
                tema={tema}
                isLast={index === materia.temas.length - 1}
                aberto={temaAbertoId === tema.tema_id}
                onToggle={() => onToggleTema(tema.tema_id)}
                cor={cor}
                onAbrirModulo={onAbrirModulo}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}