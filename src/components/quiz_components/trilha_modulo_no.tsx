"use client";

import { Check, Lock, Play } from "lucide-react";
import { motion } from "motion/react";
import { NO_TAMANHO, ladoRotulo, posicaoNo } from "@/components/quiz_components/trilha_geometria";
import type { TrilhaMateria } from "@/schemas/quiz";

type ModuloTrilha = TrilhaMateria["temas"][number]["modulos"][number];

const NO_CLASSES: Record<ModuloTrilha["estado"], string> = {
  concluido: "border-[#3f6b34] bg-[#DDE9C5] text-[#3f6b34]",
  disponivel: "border-orange bg-orange text-white",
  bloqueado: "border-line bg-surface text-gray",
};

const NO_ICONE = {
  concluido: Check,
  disponivel: Play,
  bloqueado: Lock,
} as const;

interface TrilhaModuloNoProps {
  modulo: ModuloTrilha;
  indice: number;
  selecionado: boolean;
  destacado: boolean;
  onSelecionar: () => void;
}

export function TrilhaModuloNo({ modulo, indice, selecionado, destacado, onSelecionar }: TrilhaModuloNoProps) {
  const { x, y } = posicaoNo(indice);
  const Icone = NO_ICONE[modulo.estado];
  const bloqueado = modulo.estado === "bloqueado";

  return (
    <motion.div
      className="absolute"
      style={{ left: x - NO_TAMANHO / 2, top: y - NO_TAMANHO / 2, width: NO_TAMANHO, height: NO_TAMANHO }}
      initial={{ opacity: 0, scale: 0.4, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 + indice * 0.09 }}
    >
      <div className="relative" style={{ width: NO_TAMANHO, height: NO_TAMANHO }}>
        {modulo.estado === "disponivel" && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-orange/40"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <motion.button
          type="button"
          onClick={onSelecionar}
          aria-label={`${modulo.titulo} — ${bloqueado ? "bloqueado" : modulo.estado === "concluido" ? "concluído" : "disponível"}`}
          aria-pressed={selecionado}
          data-estado={modulo.estado}
          className={`relative flex h-full w-full items-center justify-center rounded-full border-2 shadow-neo-raised-sm focus-visible:ring-4 focus-visible:ring-orange/30 focus-visible:outline-none ${NO_CLASSES[modulo.estado]} ${
            selecionado || destacado ? "ring-4 ring-orange/30" : ""
          }`}
          whileHover={{ scale: bloqueado ? 1.03 : 1.1 }}
          whileTap={bloqueado ? { x: [0, -5, 5, -3, 3, 0], transition: { duration: 0.35 } } : { scale: 0.94 }}
        >
          <Icone size={24} strokeWidth={2.4} />
        </motion.button>
      </div>
      <span
        className={`absolute top-1/2 line-clamp-2 w-[120px] -translate-y-1/2 text-[12.5px] leading-tight ${
          ladoRotulo(indice) === "esquerda" ? "right-full mr-3 text-right" : "left-full ml-3 text-left"
        } ${bloqueado ? "text-gray" : "font-semibold text-charcoal"}`}
      >
        {modulo.titulo}
      </span>
    </motion.div>
  );
}
