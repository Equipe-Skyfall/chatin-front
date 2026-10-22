import { Eye, Loader2, Pencil, ThumbsUp, Trash2 } from "lucide-react";
import { SubjectIconBadge, getSubjectColor } from "@/components/progresso_components/subject_icon";
import type { Materia } from "@/lib/materias";

interface MateriaCardProps {
  materia: Materia;
  onAbrir: () => void;
  /** Só quem criou a apostila pode editar/excluir (o back valida de novo). */
  podeGerenciar?: boolean;
  onEditar?: () => void;
  onGerenciarConteudo?: () => void;
  onExcluir?: () => void;
  /** Conteúdo sendo gerado em segundo plano (mostra o estado no rodapé). */
  gerando?: boolean;
}

const acaoClassName =
  "flex items-center gap-1 rounded-[8px] border border-line px-2.5 py-1 text-[11px] font-semibold text-gray transition hover:border-orange hover:text-orange";

export function MateriaCard({
  materia,
  onAbrir,
  podeGerenciar = false,
  onEditar,
  onGerenciarConteudo,
  onExcluir,
  gerando = false,
}: MateriaCardProps) {
  const cor = getSubjectColor(materia.id);

  return (
    <article className="group flex min-h-[210px] overflow-hidden rounded-l-[3px] rounded-r-[10px] bg-[#fffdf8] text-left shadow-[0_1px_2px_rgba(34,26,15,0.06),0_6px_18px_rgba(34,26,15,0.10)] transition hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(34,26,15,0.08),0_14px_30px_rgba(34,26,15,0.16)]">
      <div className="relative w-3.5 shrink-0" style={{ backgroundColor: cor }} aria-hidden="true">
        <div className="absolute inset-y-0 right-0 w-px bg-black/15" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <button type="button" onClick={onAbrir} className="flex min-w-0 flex-1 flex-col p-5 text-left">
          <div className="flex items-center justify-between">
            <SubjectIconBadge nome={materia.nome} materiaId={materia.id} cor={cor} size={40} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray">
              {podeGerenciar ? "Sua apostila" : "Apostila"}
            </span>
          </div>

          <h3 className="mt-4 font-display text-[17px] font-semibold leading-snug text-charcoal">{materia.nome}</h3>
          <p className="mt-1.5 line-clamp-3 font-serif text-[13px] leading-relaxed text-gray">{materia.descricao}</p>

          <div className="mt-auto flex items-center justify-between border-t border-dashed border-line pt-3">
            <span className="flex items-center gap-1 text-[11px] text-gray">
              <ThumbsUp size={12} /> {materia.votos}
            </span>
            {gerando ? (
              <span className="flex items-center gap-1 text-[11.5px] font-medium text-orange">
                <Loader2 size={12} className="animate-spin" /> Gerando conteúdo…
              </span>
            ) : (
              <span className="text-[11.5px] font-medium text-gray transition group-hover:text-orange">
                Abrir apostila →
              </span>
            )}
          </div>
        </button>

        {podeGerenciar && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-2.5">
            {onEditar && (
              <button type="button" onClick={onEditar} className={acaoClassName}>
                <Pencil size={12} /> Editar
              </button>
            )}
            {onGerenciarConteudo && (
              <button type="button" onClick={onGerenciarConteudo} className={acaoClassName}>
                <Eye size={12} /> Conteúdo
              </button>
            )}
            {onExcluir && (
              <button
                type="button"
                onClick={onExcluir}
                className="flex items-center gap-1 rounded-[8px] border border-line px-2.5 py-1 text-[11px] font-semibold text-gray transition hover:border-[#d1442e] hover:text-[#d1442e]"
              >
                <Trash2 size={12} /> Excluir
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
