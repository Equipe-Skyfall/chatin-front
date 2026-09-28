"use client";

import { useEffect, useRef } from "react";
import { Play, Zap } from "lucide-react";
import type { Trilha } from "@/schemas/quiz";

const ESTADO_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  concluido: "Concluído",
  bloqueado: "Bloqueado",
};

const ESTADO_CLASSES: Record<string, string> = {
  disponivel: "bg-orange/10 text-orange",
  concluido: "bg-[#DDE9C5] text-[#3f6b34]",
  bloqueado: "bg-gray/10 text-gray",
};

interface TrilhaViewProps {
  trilha: Trilha | null;
  onPraticar: (moduloId: string, titulo: string) => void;
  onConcluir: (moduloId: string, titulo: string) => void;
  highlightModuloId?: string | null;
  mostrarTituloMateria?: boolean;
}

export function TrilhaView({
  trilha,
  onPraticar,
  onConcluir,
  highlightModuloId,
  mostrarTituloMateria = true,
}: TrilhaViewProps) {
  const highlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (highlightModuloId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightModuloId, trilha]);

  if (!trilha) return null;
  if (trilha.materias.length === 0) {
    return <p className="text-sm text-gray">Nenhuma matéria disponível ainda.</p>;
  }
  return (
    <div className="flex flex-col gap-5">
      {trilha.materias.map((materia) => (
        <div key={materia.id}>
          {mostrarTituloMateria && (
            <h2 className="font-display mb-3 text-[18px] font-semibold text-charcoal">{materia.nome}</h2>
          )}
          <div className="flex flex-col gap-5">
            {materia.temas.map((tema) => (
              <section key={tema.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-[15px] font-semibold text-charcoal">{tema.titulo}</h3>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-semibold ${ESTADO_CLASSES[tema.estado]}`}
                  >
                    {ESTADO_LABEL[tema.estado]}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {tema.modulos.length === 0 && (
                    <p className="text-[13px] text-gray">Nenhum módulo neste tópico.</p>
                  )}
                  {tema.modulos.map((modulo) => {
                    const destacado = modulo.id === highlightModuloId;
                    return (
                      <div
                        key={modulo.id}
                        ref={destacado ? highlightRef : undefined}
                        className={`flex flex-wrap items-center justify-between gap-5 rounded-[10px] border border-line bg-surface px-5 py-2.5 transition ${
                          destacado ? "ring-2 ring-orange ring-offset-2" : ""
                        }`}
                      >
                        <div className="flex h-full h-15 items-center gap-2">
                          <span className="truncate text-[15px] text-charcoal">{modulo.titulo}</span>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-semibold ${ESTADO_CLASSES[modulo.estado]}`}
                          >
                            {ESTADO_LABEL[modulo.estado]}
                          </span>
                        </div>
                        {modulo.estado !== "bloqueado" && (
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onPraticar(modulo.id, modulo.titulo)}
                              className="flex items-center gap-1.5 rounded-[10px] border border-orange/60 bg-orange/5 px-3.5 py-2 text-[12px] font-semibold text-orange shadow-neo-raised-sm transition hover:border-orange hover:bg-orange/15 active:shadow-neo-inset-sm"
                            >
                              <Play size={13} />
                              Praticar Quiz (sem XP)
                            </button>
                            <button
                              type="button"
                              onClick={() => onConcluir(modulo.id, modulo.titulo)}
                              className="flex items-center gap-1.5 rounded-[10px] bg-orange px-3.5 py-2 text-[12px] font-semibold text-white shadow-neo-raised-sm transition hover:bg-orange-light active:shadow-neo-inset-sm"
                            >
                              <Zap size={13} />
                              Realizar Quiz (XP)
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
