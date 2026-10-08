"use client";

import { Lock, Play, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { TrilhaMateria } from "@/schemas/quiz";

type ModuloTrilha = TrilhaMateria["temas"][number]["modulos"][number];

interface TrilhaModuloAcoesProps {
  id?: string;
  modulo: ModuloTrilha;
  onPraticar: (moduloId: string, titulo: string) => void;
  onConcluir: (moduloId: string, titulo: string) => void;
}

export function TrilhaModuloAcoes({ id, modulo, onPraticar, onConcluir }: TrilhaModuloAcoesProps) {
  const bloqueado = modulo.estado === "bloqueado";

  return (
    <motion.div
      id={id}
      key={modulo.id}
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="mt-4 flex flex-col items-center gap-3 rounded-[12px] border border-line bg-surface px-5 py-4 text-center">
        <p className="font-display text-[14px] font-semibold text-charcoal">{modulo.titulo}</p>
        {bloqueado ? (
          <p className="flex items-center gap-1.5 text-[12.5px] text-gray">
            <Lock size={14} />
            Conclua o módulo anterior para desbloquear este.
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2">
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
    </motion.div>
  );
}
