import { MessageCircle, Route } from "lucide-react";
import { CircularProgress } from "@/components/progresso_components/circular_progress";
import { SubjectIconBadge } from "@/components/progresso_components/subject_icon";
import type { MateriaProgresso } from "@/lib/progresso";

interface MinhaTrilhaCardProps {
  materia: MateriaProgresso;
  cor: string;
  /** Abre o chat já na trilha. */
  onConversar: () => void;
  /** Mostra o caminho (nós dos módulos) desta trilha no Início. */
  onVerCaminho?: () => void;
  caminhoAberto?: boolean;
}

/** Cartão de "Minhas trilhas": progresso e a ação de conversar sobre a trilha. */
export function MinhaTrilhaCard({ materia, cor, onConversar, onVerCaminho, caminhoAberto = false }: MinhaTrilhaCardProps) {
  const topicos = materia.temas.length;

  return (
    <article className="flex flex-col overflow-hidden rounded-[16px] bg-white shadow-neo-raised">
      <div className="h-1.5 w-full" style={{ backgroundColor: cor }} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SubjectIconBadge nome={materia.nome} materiaId={materia.materia_id} cor={cor} size={44} />
            <div className="min-w-0">
              <h3 className="truncate font-display text-[15px] font-semibold text-charcoal">{materia.nome}</h3>
              <p className="mt-0.5 text-[11.5px] text-gray">
                {topicos} {topicos === 1 ? "tópico" : "tópicos"} · {materia.xp} XP
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

        <div className="mt-auto flex gap-2">
          {onVerCaminho && (
            <button
              type="button"
              onClick={onVerCaminho}
              aria-pressed={caminhoAberto}
              aria-label={`Ver caminho de ${materia.nome}`}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-colors focus-visible:ring-4 focus-visible:ring-orange/20 focus-visible:outline-none ${
                caminhoAberto ? "border-orange bg-orange/15 text-orange" : "border-line text-gray hover:border-orange/40"
              }`}
            >
              <Route size={14} aria-hidden="true" />
              Ver caminho
            </button>
          )}
        <button
          type="button"
          onClick={onConversar}
          aria-label={`Conversar sobre ${materia.nome}`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-orange px-4 py-2 text-[12.5px] font-semibold text-white shadow-neo-raised-sm transition hover:bg-orange-light focus-visible:ring-4 focus-visible:ring-orange/30 focus-visible:outline-none active:shadow-neo-inset-sm"
        >
          <MessageCircle size={14} aria-hidden="true" />
          Conversar
        </button>
        </div>
      </div>
    </article>
  );
}
