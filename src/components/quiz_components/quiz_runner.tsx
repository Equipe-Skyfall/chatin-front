"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import type { TentativaIniciar } from "@/schemas/quiz";

interface QuizRunnerProps {
  moduloTitulo: string;
  tentativa: TentativaIniciar;
  onEnviar: (respostas: Record<string, string>) => void;
  onVoltar: () => void;
}

export function QuizRunner({ moduloTitulo, tentativa, onEnviar, onVoltar }: QuizRunnerProps) {
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [indice, setIndice] = useState(0);

  const total = tentativa.questoes.length;
  const questao = tentativa.questoes[indice];
  const ultima = indice === total - 1;
  const todasRespondidas = tentativa.questoes.every((q) => respostas[q.id]);

  if (!questao) {
    return <p className="text-[13px] text-gray">Nenhuma questão disponível para este módulo.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[13px] uppercase tracking-wide text-gray">{moduloTitulo}</p>
          <h2 className="font-display text-md font-semibold text-charcoal">
            {tentativa.pratica ? "Questionário de prática" : "Questionário de conclusão (vale XP)"}
          </h2>
        </div>
        <button type="button" onClick={onVoltar} className="text-xs text-gray underline">
          voltar
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray">
          Questão {indice + 1} de {total}
        </p>
        <div className="flex gap-1">
          {tentativa.questoes.map((q, i) => (
            <span
              key={q.id}
              className={`h-3 w-6 rounded-full ${
                respostas[q.id] ? "bg-orange" : i === indice ? "bg-orange/40" : "bg-gray/20"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-3 h-[60vh]">
        <p className="mb-3 text-md font-medium text-charcoal">{questao.enunciado}</p>
        <div className="flex flex-col gap-2">
          {questao.alternativas.map((alt) => {
            const marcada = respostas[questao.id] === alt.letra;
            return (
              <label
                key={alt.letra}
                className={`flex cursor-pointer items-center gap-2 rounded-md h-20 border px-3 py-2 text-md transition-colors ${
                  marcada
                    ? "border-orange bg-orange/10 text-orange"
                    : "border-line bg-white text-charcoal hover:border-orange/40"
                }`}
              >
                <input
                  type="radio"
                  name={questao.id}
                  value={alt.letra}
                  checked={marcada}
                  onChange={() => setRespostas((r) => ({ ...r, [questao.id]: alt.letra }))}
                  className="mt-0.5"
                />
                <span>
                  <strong>{alt.letra})</strong> {alt.texto}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          className="flex items-center gap-1.5 rounded-[10px] border border-line px-3.5 py-2 text-[12px] font-semibold text-charcoal transition-colors hover:border-orange hover:text-orange disabled:opacity-40 disabled:hover:border-line disabled:hover:text-charcoal"
        >
          <ChevronLeft size={15} />
          Anterior
        </button>

        {ultima ? (
          <button
            type="button"
            onClick={() => onEnviar(respostas)}
            disabled={!todasRespondidas}
            className="flex items-center gap-1.5 rounded-[10px] bg-orange px-4 py-2 text-[12px] font-semibold text-white shadow-neo-raised-sm transition hover:bg-orange-light active:shadow-neo-inset-sm disabled:opacity-40"
          >
            <Send size={14} />
            Enviar respostas
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndice((i) => Math.min(total - 1, i + 1))}
            className="flex items-center gap-1.5 rounded-[10px] bg-orange px-4 py-2 text-[12px] font-semibold text-white shadow-neo-raised-sm transition hover:bg-orange-light active:shadow-neo-inset-sm"
          >
            Próxima
            <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
