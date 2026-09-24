"use client";

import { useEffect, useRef } from "react";
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
}

export function TrilhaView({ trilha, onPraticar, onConcluir, highlightModuloId }: TrilhaViewProps) {
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
          <h2 className="font-display mb-2 font-bold text-charcoal">{materia.nome}</h2>
          {materia.temas.map((tema) => (
            <div key={tema.id} className="mb-3">
              <p className="mb-1.5 text-[13px] tracking-wide text-gray">{tema.titulo}</p>
              <div className="flex flex-col gap-2">
                {tema.modulos.map((modulo) => {
                  const destacado = modulo.id === highlightModuloId;
                  return (
                    <div
                      key={modulo.id}
                      ref={destacado ? highlightRef : undefined}
                      className={`flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-neo-raised transition ${
                        destacado ? "ring-2 ring-orange ring-offset-2" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-charcoal">{modulo.titulo}</span>
                        <span
                          className={`rounded-full px-3 py-2 text-[12px] font-bold! ${ESTADO_CLASSES[modulo.estado]}`}
                        >
                          {ESTADO_LABEL[modulo.estado]}
                        </span>
                      </div>
                      {modulo.estado !== "bloqueado" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onPraticar(modulo.id, modulo.titulo)}
                            className="rounded-md bg-surface font-bold! px-3 py-1.5 text-xs font-semibold text-orange shadow-neo-raised-sm transition active:shadow-neo-inset-sm"
                          >
                            Praticar Quiz (sem XP)
                          </button>
                          <button
                            onClick={() => onConcluir(modulo.id, modulo.titulo)}
                            className="rounded-md bg-orange px-3 py-1.5 text-xs font-semibold font-bold! text-white shadow-neo-raised-sm transition active:shadow-neo-inset-sm"
                          >
                            Realizar Quiz (XP)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}