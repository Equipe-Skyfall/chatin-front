"use client";

import { Download, FileText } from "lucide-react";
import { urlPdfResumo } from "@/lib/resumos";
import type { ResumoEstudoListItem } from "@/interfaces/resumo_interfaces";

function formatarData(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface ResumoCardProps {
  resumo: ResumoEstudoListItem;
  onAbrir: (id: string) => void;
}

export function ResumoCard({ resumo, onAbrir }: ResumoCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-[12px] border border-line bg-white p-4 shadow-neo-raised-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-orange/10 text-orange">
          <FileText size={18} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-sm font-semibold text-charcoal">
            {resumo.modulo_titulo || resumo.titulo}
          </h3>
          <p className="text-[11px] text-gray">{formatarData(resumo.updated_at)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAbrir(resumo.id)}
          className="rounded-[9px] border border-orange px-3 py-1.5 text-[12px] font-semibold text-orange transition-colors hover:bg-orange/10"
        >
          Abrir
        </button>
        <a
          href={urlPdfResumo(resumo.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-[9px] bg-orange px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-orange-light"
        >
          <Download size={14} />
          Baixar PDF
        </a>
      </div>
    </article>
  );
}
