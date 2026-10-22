"use client";

import { MotionConfig } from "motion/react";
import { TrilhaTemaCaminho } from "@/components/quiz_components/trilha_tema_caminho";
import type { TrilhaMateria } from "@/interfaces/chat_interfaces";

interface TrilhaCaminhoPainelProps {
  materia: TrilhaMateria;
  /** Toque no ▶ de um módulo desbloqueado. A ação é da tela: ler na apostila (Início) ou ancorar o chat (seletor do chat). */
  onIniciarModulo: (materiaId: string, temaId: string, moduloId: string) => void;
  /** Texto acima do caminho; por padrão convida a ler o módulo. */
  instrucao?: string;
}

/** O caminho animado de uma trilha (um por tópico), reaproveitado no Início e na troca de matéria do chat. */
export function TrilhaCaminhoPainel({ materia, onIniciarModulo, instrucao }: TrilhaCaminhoPainelProps) {
  return (
    <MotionConfig reducedMotion="user">
      <p className="text-[11px] font-semibold tracking-wide text-gray uppercase">
        {instrucao ?? `Toque no ▶ para ler em ${materia.nome}`}
      </p>
      {materia.temas.length === 0 ? (
        <p className="mt-2 text-[13px] text-gray">Esta trilha ainda não tem módulos prontos.</p>
      ) : (
        <div className="mt-2 flex flex-col gap-5">
          {materia.temas.map((tema, indice) => (
            <TrilhaTemaCaminho
              key={`${materia.id}-${tema.id}`}
              tema={tema}
              indice={indice}
              aoIniciarModulo={(modulo) => onIniciarModulo(materia.id, tema.id, modulo.id)}
            />
          ))}
        </div>
      )}
    </MotionConfig>
  );
}
