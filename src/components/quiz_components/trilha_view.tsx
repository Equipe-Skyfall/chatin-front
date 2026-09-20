import type { Trilha } from "@/schemas/quiz";

const ESTADO_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  concluido: "Concluído",
  bloqueado: "Bloqueado",
};

const ESTADO_CLASSES: Record<string, string> = {
  disponivel: "bg-orange/10 text-orange",
  concluido: "bg-[#DDE9C5] text-[#3f6b34]",
  bloqueado: "bg-gray/10 text-gray",
};

interface TrilhaViewProps {
  trilha: Trilha | null;
  onPraticar: (moduloId: string, titulo: string) => void;
  onConcluir: (moduloId: string, titulo: string) => void;
}

export function TrilhaView({ trilha, onPraticar, onConcluir }: TrilhaViewProps) {
  if (!trilha) return null;
  if (trilha.materias.length === 0) {
    return <p className="text-sm text-gray">Nenhuma matéria disponível ainda.</p>;
  }
  return (
    <div className="flex flex-col gap-5">
      {trilha.materias.map((materia) => (
        <div key={materia.id}>
          <h2 className="font-display mb-2 text-sm font-semibold text-charcoal">{materia.nome}</h2>
          {materia.temas.map((tema) => (
            <div key={tema.id} className="mb-3">
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-gray">{tema.titulo}</p>
              <div className="flex flex-col gap-2">
                {tema.modulos.map((modulo) => (
                  <div
                    key={modulo.id}
                    className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-neo-raised"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-charcoal">{modulo.titulo}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ESTADO_CLASSES[modulo.estado]}`}
                      >
                        {ESTADO_LABEL[modulo.estado]}
                      </span>
                    </div>
                    {modulo.estado !== "bloqueado" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onPraticar(modulo.id, modulo.titulo)}
                          className="rounded-md bg-surface px-3 py-1.5 text-xs font-semibold text-orange shadow-neo-raised-sm transition active:shadow-neo-inset-sm"
                        >
                          Praticar
                        </button>
                        <button
                          onClick={() => onConcluir(modulo.id, modulo.titulo)}
                          className="rounded-md bg-orange px-3 py-1.5 text-xs font-semibold text-white shadow-neo-raised-sm transition active:shadow-neo-inset-sm"
                        >
                          Concluir (vale XP)
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
