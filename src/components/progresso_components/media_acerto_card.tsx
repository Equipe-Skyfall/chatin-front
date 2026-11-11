import { Target } from "lucide-react";
import { CircularProgress } from "./circular_progress";

interface MediaAcertoCardProps {
  media: number | null;
  totalRespostas: number;
}

export function MediaAcertoCard({ media, totalRespostas }: MediaAcertoCardProps) {
  const arredondada = media === null ? null : Math.round(media);

  return (
    <section
      aria-label="Média de acerto"
      className="flex items-center gap-4 rounded-[14px] bg-surface p-4 shadow-neo-raised"
    >
      {arredondada === null ? (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent-blue/10">
          <Target size={24} className="text-accent-blue-ink" aria-hidden="true" />
        </span>
      ) : (
        <div className="relative flex size-16 shrink-0 items-center justify-center">
          <CircularProgress percent={arredondada} color="#3b82f6" />
          <span className="absolute font-display text-[13px] font-bold text-charcoal">{arredondada}%</span>
        </div>
      )}
      <div className="min-w-0">
        <h2 className="font-display text-[15px] font-semibold text-charcoal">Média de acerto</h2>
        {arredondada === null ? (
          <p className="mt-0.5 text-[13px] leading-relaxed text-gray">
            Responda um questionário para ver sua média de acerto.
          </p>
        ) : (
          <p className="mt-0.5 text-[13px] leading-relaxed text-gray">
            Você acertou {arredondada}% das {totalRespostas.toLocaleString("pt-BR")}{" "}
            {totalRespostas === 1 ? "resposta" : "respostas"} em seus questionários.
          </p>
        )}
      </div>
    </section>
  );
}
