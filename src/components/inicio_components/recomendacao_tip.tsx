import { ArrowRight, Sparkles } from "lucide-react";
import { SubjectIconBadge, getSubjectColor } from "@/components/progresso_components/subject_icon";
import type { MotivoRecomendacao, Recomendacao } from "@/interfaces/recomendacao_interfaces";

interface RecomendacaoTipProps {
  recomendacoes: Recomendacao[];
  onEstudar: (recomendacao: Recomendacao) => void;
}

const MOTIVO_LABEL: Record<MotivoRecomendacao, string> = {
  nao_estudado: "Novo conteúdo",
  baixo_desempenho: "Para reforçar",
  revisao_espacada: "Revisão",
};

const MOTIVO_CLASSES: Record<MotivoRecomendacao, string> = {
  nao_estudado: "bg-accent-blue text-accent-blue-ink",
  baixo_desempenho: "bg-orange/10 text-orange",
  revisao_espacada: "bg-accent-green text-accent-green-ink",
};

function textoUltimoEstudo(dias: number): string {
  if (dias === 0) return "estudado hoje";
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

/** Tip de estudo do Início: os próximos módulos sugeridos, do mais urgente ao menos. */
export function RecomendacaoTip({ recomendacoes, onEstudar }: RecomendacaoTipProps) {
  return (
    <aside aria-label="Sugestões de estudo" className="rounded-[16px] bg-white p-4 shadow-neo-raised">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray">
        <Sparkles size={12} aria-hidden="true" />
        Sugestões para você
      </div>

      <ul className="mt-1 divide-y divide-line">
        {recomendacoes.map((recomendacao) => {
          const dias = recomendacao.dias_desde_ultimo_estudo;

          return (
            <li
              key={recomendacao.modulo_id}
              className="flex flex-col gap-3 py-3 first:pt-2 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-orange/10 font-display text-[11px] font-bold text-orange">
                  {recomendacao.posicao}
                </span>

                <SubjectIconBadge
                  nome={recomendacao.materia_nome}
                  materiaId={recomendacao.materia_id}
                  cor={getSubjectColor(recomendacao.materia_id)}
                  size={36}
                />

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-[14px] font-semibold text-charcoal">
                    {recomendacao.modulo_titulo}
                  </h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-gray">
                    <span className="truncate">
                      {recomendacao.materia_nome} · {recomendacao.tema_titulo}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${MOTIVO_CLASSES[recomendacao.motivo]}`}
                    >
                      {MOTIVO_LABEL[recomendacao.motivo]}
                    </span>
                    {dias != null && <span>{textoUltimoEstudo(dias)}</span>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-gray">
                    {recomendacao.justificativa}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onEstudar(recomendacao)}
                aria-label={`Estudar ${recomendacao.modulo_titulo}`}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-full bg-orange px-4 py-2 text-[12.5px] font-semibold text-white shadow-neo-raised-sm transition hover:bg-orange-light focus-visible:ring-4 focus-visible:ring-orange/30 focus-visible:outline-none active:shadow-neo-inset-sm sm:self-center"
              >
                Estudar
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
