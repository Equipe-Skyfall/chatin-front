"use client";

import { MotionConfig } from "motion/react";
import { TrilhaTemaCaminho } from "@/components/quiz_components/trilha_tema_caminho";
import type { Trilha } from "@/schemas/quiz";

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
  if (!trilha) return null;
  if (trilha.materias.length === 0) {
    return <p className="text-sm text-gray">Nenhuma matéria disponível ainda.</p>;
  }
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-5">
        {trilha.materias.map((materia) => (
          <div key={materia.id}>
            {mostrarTituloMateria && (
              <h2 className="font-display mb-3 text-[18px] font-semibold text-charcoal">{materia.nome}</h2>
            )}
            <div className="flex flex-col gap-5">
              {materia.temas.map((tema, indice) => (
                <TrilhaTemaCaminho
                  key={tema.id}
                  tema={tema}
                  indice={indice}
                  highlightModuloId={highlightModuloId}
                  onPraticar={onPraticar}
                  onConcluir={onConcluir}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </MotionConfig>
  );
}
