import { CheckCircle2, ChevronDown, ChevronRight, Circle, Lock } from "lucide-react";
import { estadoBadgeClass, estadoLabel, type TemaProgresso } from "@/lib/progresso";
import { ModuloChecklistRow } from "./modulo_checklist_row";

interface TemaTimelineItemProps {
  tema: TemaProgresso;
  isLast: boolean;
  aberto: boolean;
  onToggle: () => void;
  cor: string;
}

function IconePorEstado({ estado, cor }: { estado: string; cor: string }) {
  if (estado === "concluido") return <CheckCircle2 size={18} style={{ color: cor }} />;
  if (estado === "bloqueado") return <Lock size={16} className="text-gray" />;
  return <Circle size={18} style={{ color: cor }} />;
}

export function TemaTimelineItem({ tema, isLast, aberto, onToggle, cor }: TemaTimelineItemProps) {
  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-white"
          style={{ borderColor: tema.estado === "bloqueado" ? "#e5e7eb" : cor }}
        >
          <IconePorEstado estado={tema.estado} cor={cor} />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-line" />}
      </div>

      <div className="min-w-0 flex-1 pb-5">
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-2 text-left">
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium text-charcoal">{tema.titulo}</p>
            <p className="mt-0.5 text-[11px] text-gray">{tema.percentual_completo}% concluído</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${estadoBadgeClass(tema.estado)}`}>
              {estadoLabel(tema.estado)}
            </span>
            {aberto ? <ChevronDown size={14} className="text-gray" /> : <ChevronRight size={14} className="text-gray" />}
          </div>
        </button>

        {aberto && (
          <div className="mt-2 grid gap-1.5">
            {tema.modulos.length === 0 && <p className="text-[12px] text-gray">Nenhum módulo neste tópico.</p>}
            {tema.modulos.map((modulo) => (
              <ModuloChecklistRow key={modulo.modulo_id} modulo={modulo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}