import { Zap } from "lucide-react";
import type { ProgressoMateria } from "@/interfaces/progresso_interfaces";

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

function BarraProgresso({ percentual }: { percentual: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-orange/15">
      <div
        className="h-full rounded-full bg-orange transition-[width]"
        style={{ width: `${Math.min(100, Math.max(0, percentual))}%` }}
      />
    </div>
  );
}

interface MateriaProgressoCardProps {
  materia: ProgressoMateria;
}

export function MateriaProgressoCard({ materia }: MateriaProgressoCardProps) {
  return (
    <div className="rounded-xl bg-surface p-4 shadow-neo-raised">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold text-charcoal">{materia.nome}</h2>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-orange/10 px-2.5 py-1 text-[11px] font-semibold text-orange shadow-neo-inset-sm">
          <Zap size={12} />
          {materia.xp} XP
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <BarraProgresso percentual={materia.percentual_completo} />
        <span className="shrink-0 text-[11px] text-gray">{materia.percentual_completo.toFixed(0)}%</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {materia.temas.map((tema) => (
          <div key={tema.tema_id}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-wide text-gray">{tema.titulo}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-neo-inset-sm ${ESTADO_CLASSES[tema.estado]}`}
              >
                {ESTADO_LABEL[tema.estado]}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <BarraProgresso percentual={tema.percentual_completo} />
              <span className="shrink-0 text-[10px] text-gray">{tema.percentual_completo.toFixed(0)}%</span>
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {tema.modulos.map((modulo) => (
                <div
                  key={modulo.modulo_id}
                  className="flex items-center justify-between rounded-md bg-surface px-3 py-1.5 text-xs shadow-neo-inset-sm"
                >
                  <span className="text-charcoal">{modulo.titulo}</span>
                  <span className="shrink-0 text-gray">
                    {modulo.melhor_pontuacao != null
                      ? `${modulo.melhor_pontuacao.toFixed(0)}% · ${modulo.tentativas_count} tentativa${modulo.tentativas_count === 1 ? "" : "s"}`
                      : ESTADO_LABEL[modulo.estado]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
