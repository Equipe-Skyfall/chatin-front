"use client";

import { Check, MessageSquare } from "lucide-react";
import { motion } from "motion/react";

interface TrilhaModuloEscolhaProps {
  id?: string;
  titulo: string;
  escolhido: boolean;
  onEscolher: () => void;
}

/** Painel do nó da trilha no chat: em vez de Praticar/Realizar, escolhe o
 * módulo como contexto da conversa. */
export function TrilhaModuloEscolha({ id, titulo, escolhido, onEscolher }: TrilhaModuloEscolhaProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="mt-4 flex flex-col items-center gap-3 rounded-[12px] border border-line bg-surface px-5 py-4 text-center">
        <p className="font-display text-[14px] font-semibold text-charcoal">{titulo}</p>
        {escolhido ? (
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3f6b34]">
            <Check size={14} />
            Módulo escolhido para esta conversa
          </p>
        ) : (
          <button
            type="button"
            onClick={onEscolher}
            className="flex items-center gap-1.5 rounded-[10px] bg-orange px-3.5 py-2 text-[12px] font-semibold text-white shadow-neo-raised-sm transition hover:bg-orange-light active:shadow-neo-inset-sm"
          >
            <MessageSquare size={13} />
            Conversar sobre este módulo
          </button>
        )}
      </div>
    </motion.div>
  );
}
