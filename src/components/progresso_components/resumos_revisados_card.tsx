import { BookOpenCheck } from "lucide-react";

interface ResumosRevisadosCardProps {
  total: number;
}

export function ResumosRevisadosCard({ total }: ResumosRevisadosCardProps) {
  const revisoes = total.toLocaleString("pt-BR");

  return (
    <section
      aria-label="Resumos revisados"
      className="flex items-center gap-4 rounded-[14px] bg-white p-4 shadow-neo-raised"
    >
      <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-orange/10">
        <BookOpenCheck size={24} className="text-orange" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-[15px] font-semibold text-charcoal">Resumos revisados</h2>
        {total === 0 ? (
          <p className="mt-0.5 text-[13px] leading-relaxed text-gray">
            Abra um resumo da Biblioteca para acompanhar seu hábito de revisão.
          </p>
        ) : (
          <p className="mt-0.5 text-[13px] leading-relaxed text-gray">
            Você fez {revisoes} {total === 1 ? "revisão" : "revisões"} de resumos da sua biblioteca.
          </p>
        )}
      </div>
    </section>
  );
}
