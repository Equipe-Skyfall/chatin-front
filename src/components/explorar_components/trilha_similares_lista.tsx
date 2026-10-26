import { BookOpen, Users } from "lucide-react";
import { TrilhaOrigemBadge } from "@/components/explorar_components/trilha_origem_badge";
import { primaryButtonClassName } from "@/components/admin_components/form_field";
import type { TrilhaSimilar } from "@/interfaces/trilha_interfaces";

interface TrilhaSimilaresListaProps {
  trilhas: TrilhaSimilar[];
  /** Id da trilha sendo adicionada; trava os botões enquanto isso. */
  usandoId: string | null;
  onUsar: (trilha: TrilhaSimilar) => void;
}

export function TrilhaSimilaresLista({ trilhas, usandoId, onUsar }: TrilhaSimilaresListaProps) {
  return (
    <ul className="grid gap-2">
      {trilhas.map((trilha) => (
        <li
          key={trilha.id}
          className="flex flex-col gap-2 rounded-[10px] bg-white p-3 shadow-neo-raised-sm sm:flex-row sm:items-center"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-display text-[13px] font-semibold text-charcoal">{trilha.nome}</h3>
              <TrilhaOrigemBadge verificada={trilha.verificada} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray">
              <span className="inline-flex items-center gap-1">
                <BookOpen size={12} aria-hidden="true" />
                {trilha.temas} tópicos · {trilha.modulos} módulos
              </span>
              <span className="inline-flex items-center gap-1">
                <Users size={12} aria-hidden="true" />
                {trilha.alunos} alunos
              </span>
              <span>{Math.round(trilha.similaridade * 100)}% parecida</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onUsar(trilha)}
            disabled={usandoId !== null}
            aria-label={`Usar a trilha ${trilha.nome}`}
            className={`${primaryButtonClassName} !w-auto shrink-0 px-4 !text-[12px]`}
          >
            {usandoId === trilha.id ? "Abrindo..." : "Usar esta trilha"}
          </button>
        </li>
      ))}
    </ul>
  );
}
