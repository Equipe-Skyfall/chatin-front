"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TrilhaModuloNo } from "@/components/quiz_components/trilha_modulo_no";
import { TrilhaModuloAcoes } from "@/components/quiz_components/trilha_modulo_acoes";
import {
  CAMINHO_LARGURA,
  alturaCaminho,
  nosAlcancados,
  tracadoCaminho,
} from "@/components/quiz_components/trilha_geometria";
import { estadoBadgeClass, estadoLabel } from "@/lib/progresso";
import type { TrilhaMateria } from "@/schemas/quiz";

type TemaTrilha = TrilhaMateria["temas"][number];

interface TrilhaTemaCaminhoProps {
  tema: TemaTrilha;
  indice: number;
  highlightModuloId?: string | null;
  onPraticar: (moduloId: string, titulo: string) => void;
  onConcluir: (moduloId: string, titulo: string) => void;
}

export function TrilhaTemaCaminho({ tema, indice, highlightModuloId, onPraticar, onConcluir }: TrilhaTemaCaminhoProps) {
  const destacadoNoTema = tema.modulos.some((modulo) => modulo.id === highlightModuloId);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(destacadoNoTema ? highlightModuloId ?? null : null);
  const secaoRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (destacadoNoTema && secaoRef.current) {
      secaoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [destacadoNoTema]);

  const total = tema.modulos.length;
  const concluidos = tema.modulos.filter((modulo) => modulo.estado === "concluido").length;
  const percentual = total === 0 ? 0 : Math.round((concluidos / total) * 100);
  const alcancados = nosAlcancados(tema.modulos.map((modulo) => modulo.estado));
  const painelId = `trilha-acoes-${tema.id}`;
  const moduloSelecionado = tema.modulos.find((modulo) => modulo.id === selecionadoId) ?? null;

  return (
    <motion.section
      ref={secaoRef}
      className="flex flex-col gap-3 rounded-[14px] border border-line bg-white p-5 shadow-neo-raised-sm"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: indice * 0.08, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-[15px] font-semibold text-charcoal">{tema.titulo}</h3>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${estadoBadgeClass(tema.estado)}`}>
          {estadoLabel(tema.estado)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-label={`Progresso em ${tema.titulo}`} aria-valuenow={percentual} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="h-full rounded-full bg-orange"
            initial={{ width: 0 }}
            animate={{ width: `${percentual}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          />
        </div>
        <span className="shrink-0 text-[11.5px] text-gray">
          {concluidos} de {total} {total === 1 ? "módulo" : "módulos"}
        </span>
      </div>

      {total === 0 ? (
        <p className="text-[13px] text-gray">Nenhum módulo neste tópico.</p>
      ) : (
        <div className="mx-auto w-full overflow-x-auto">
          <div className="relative mx-auto" style={{ width: CAMINHO_LARGURA, height: alturaCaminho(total) }}>
            <svg
              aria-hidden="true"
              className="absolute inset-0"
              width={CAMINHO_LARGURA}
              height={alturaCaminho(total)}
              fill="none"
            >
              <path
                d={tracadoCaminho(total)}
                stroke="currentColor"
                className="text-line"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray="2 12"
              />
              <motion.path
                d={tracadoCaminho(alcancados)}
                stroke="currentColor"
                className="text-orange"
                strokeWidth={6}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.3, ease: "easeInOut" }}
              />
            </svg>
            {tema.modulos.map((modulo, i) => (
              <TrilhaModuloNo
                key={modulo.id}
                modulo={modulo}
                indice={i}
                selecionado={modulo.id === selecionadoId}
                destacado={modulo.id === highlightModuloId}
                painelId={painelId}
                onSelecionar={() => setSelecionadoId((atual) => (atual === modulo.id ? null : modulo.id))}
              />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence initial={false} mode="wait">
        {moduloSelecionado && (
          <TrilhaModuloAcoes
            key={moduloSelecionado.id}
            id={painelId}
            modulo={moduloSelecionado}
            onPraticar={onPraticar}
            onConcluir={onConcluir}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}
