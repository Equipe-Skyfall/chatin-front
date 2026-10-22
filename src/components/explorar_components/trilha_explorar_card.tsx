import { BookOpen, ThumbsUp, Users } from "lucide-react";
import { SubjectIconBadge } from "@/components/progresso_components/subject_icon";
import { TrilhaOrigemBadge } from "@/components/explorar_components/trilha_origem_badge";
import type { TrilhaExplorar } from "@/interfaces/trilha_interfaces";

interface TrilhaExplorarCardProps {
  trilha: TrilhaExplorar;
  onAbrir: () => void;
}

function plural(n: number, singular: string, pluralForma: string) {
  return `${n} ${n === 1 ? singular : pluralForma}`;
}

export function TrilhaExplorarCard({ trilha, onAbrir }: TrilhaExplorarCardProps) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="group flex w-full flex-col gap-3 rounded-[12px] bg-white p-4 text-left shadow-neo-raised transition-shadow hover:shadow-lg focus-visible:ring-4 focus-visible:ring-orange/20 focus-visible:outline-none"
    >
      <div className="flex items-start gap-3">
        <SubjectIconBadge nome={trilha.nome} materiaId={trilha.id} cor="#f2711c" size={36} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-sm font-semibold text-charcoal">{trilha.nome}</h3>
          <p className="mt-0.5 truncate text-[11px] text-gray">
            {trilha.verificada ? "Currículo oficial" : `por ${trilha.autor_nome ?? "um aluno"}`}
          </p>
        </div>
        <TrilhaOrigemBadge verificada={trilha.verificada} />
      </div>

      {trilha.descricao && (
        <p className="line-clamp-2 text-[12px] leading-relaxed text-gray">{trilha.descricao}</p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-[11px] text-gray">
        <span className="inline-flex items-center gap-1">
          <BookOpen size={13} aria-hidden="true" />
          {plural(trilha.temas, "tópico", "tópicos")} · {plural(trilha.modulos, "módulo", "módulos")}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users size={13} aria-hidden="true" />
          {plural(trilha.alunos, "aluno", "alunos")}
        </span>
        {!trilha.verificada && (
          <span className="inline-flex items-center gap-1">
            <ThumbsUp size={13} aria-hidden="true" />
            {trilha.votos}
          </span>
        )}
        {trilha.estudando && (
          <span className="ml-auto rounded-full bg-[#5CA382]/15 px-2 py-0.5 text-[10.5px] font-semibold text-accent-green-ink">
            Estudando
          </span>
        )}
      </div>
    </button>
  );
}
