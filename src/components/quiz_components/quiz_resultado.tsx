"use client";

import type { TentativaResultado } from "@/schemas/quiz";

interface QuizResultadoProps {
  moduloTitulo: string;
  resultado: TentativaResultado;
  onVoltar: () => void;
}

export function QuizResultado({ moduloTitulo, resultado, onVoltar }: QuizResultadoProps) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray">{moduloTitulo}</p>
      <h2 className="font-display mb-1 text-lg font-semibold text-charcoal">
        {resultado.pontuacao.toFixed(0)}% · {resultado.total_corretas}/{resultado.total_questoes} corretas
      </h2>
      <button onClick={onVoltar} className="mb-4 text-xs text-gray underline">
        voltar pra trilha
      </button>

      <div className="flex flex-col gap-3">
        {resultado.resultados.map((r, idx) => (
          <div
            key={r.questao_id}
            className={`rounded-xl p-4 ${r.correta ? "bg-[#DDE9C5]/40" : "bg-[#F26753]/10"}`}
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide">
              Questão {idx + 1} · {r.correta ? "Você acertou ✅" : "Você errou ❌"}
            </p>
            <p className="text-sm text-charcoal">
              Sua resposta: <strong>{r.resposta_escolhida}</strong> · Gabarito:{" "}
              <strong>{r.resposta_correta}</strong>
            </p>
            {r.explicacao && <p className="mt-1 text-xs text-gray">{r.explicacao}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
