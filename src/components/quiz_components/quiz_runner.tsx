"use client";

import { useState } from "react";
import type { TentativaIniciar } from "@/schemas/quiz";

interface QuizRunnerProps {
  moduloTitulo: string;
  tentativa: TentativaIniciar;
  onEnviar: (respostas: Record<string, string>) => void;
  onVoltar: () => void;
}

export function QuizRunner({ moduloTitulo, tentativa, onEnviar, onVoltar }: QuizRunnerProps) {
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const todasRespondidas = tentativa.questoes.every((q) => respostas[q.id]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray">{moduloTitulo}</p>
          <h2 className="font-display text-sm font-semibold text-charcoal">
            {tentativa.pratica ? "Questionário de prática" : "Questionário de conclusão (vale XP)"}
          </h2>
        </div>
        <button onClick={onVoltar} className="text-xs text-gray underline">
          voltar
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {tentativa.questoes.map((q, idx) => (
          <div key={q.id} className="rounded-xl bg-white p-4 shadow-neo-raised">
            <p className="mb-1 text-[10px] uppercase tracking-wide text-gray">
              Múltipla escolha · questão {idx + 1}
            </p>
            <p className="mb-3 text-sm font-medium text-charcoal">{q.enunciado}</p>
            <div className="flex flex-col gap-2">
              {q.alternativas.map((alt) => (
                <label
                  key={alt.letra}
                  className={`flex cursor-pointer items-start gap-2 rounded-md px-3 py-2 text-sm ${
                    respostas[q.id] === alt.letra ? "bg-orange/10 text-orange" : "bg-white text-charcoal"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={alt.letra}
                    checked={respostas[q.id] === alt.letra}
                    onChange={() => setRespostas((r) => ({ ...r, [q.id]: alt.letra }))}
                    className="mt-0.5"
                  />
                  <span>
                    <strong>{alt.letra})</strong> {alt.texto}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!todasRespondidas}
        onClick={() => onEnviar(respostas)}
        className="mt-5 w-full rounded-md bg-orange px-4 py-2.5 text-sm font-semibold text-white shadow-neo-raised-sm transition active:shadow-neo-inset-sm disabled:opacity-40"
      >
        Enviar respostas
      </button>
    </div>
  );
}
