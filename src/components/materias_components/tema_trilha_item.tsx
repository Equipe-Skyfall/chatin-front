import { BookOpenCheck, Check, Lock } from "lucide-react";
import type { EstadosPorId, TemaComModulos } from "@/hooks/use_materia_leitura";
import type { EstadoModulo } from "@/interfaces/chat_interfaces";

interface TemaTrilhaItemProps {
  tema: TemaComModulos;
  numero: number;
  estadoTema: EstadoModulo | undefined;
  estadosModulos: EstadosPorId;
  moduloSelecionadoId: string | null;
  onSelecionarModulo: (moduloId: string) => void;
  cor: string;
  ultimo: boolean;
  /** Módulos cuja leitura o aluno já concluiu (progresso local). */
  modulosLidos?: string[];
}

function IndicadorQuiz({ estado }: { estado: EstadoModulo | undefined }) {
  if (estado === "concluido") {
    return <Check size={13} className="shrink-0 text-green-600" aria-label="Quiz concluído" />;
  }
  if (estado === "bloqueado") {
    return (
      <span
        role="img"
        aria-label="Quiz bloqueado"
        title="Quiz bloqueado"
        className="size-2 shrink-0 rounded-full border border-gray"
      />
    );
  }
  return (
    <span
      role="img"
      aria-label="Quiz disponível"
      title="Quiz disponível"
      className="size-2 shrink-0 rounded-full bg-orange"
    />
  );
}

export function TemaTrilhaItem({
  tema,
  numero,
  estadoTema,
  estadosModulos,
  moduloSelecionadoId,
  onSelecionarModulo,
  cor,
  ultimo,
  modulosLidos = [],
}: TemaTrilhaItemProps) {
  const bloqueado = estadoTema === "bloqueado";
  const total = tema.modulos.length;
  const concluidos = tema.modulos.filter((modulo) => estadosModulos[modulo.id] === "concluido").length;
  const aprovado = estadoTema === "concluido" || (total > 0 && concluidos === total);
  const percentual = aprovado ? 100 : total === 0 ? 0 : Math.round((concluidos / total) * 100);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2"
          style={{
            borderColor: bloqueado ? "#d1d5db" : cor,
            backgroundColor: aprovado && !bloqueado ? cor : "#ffffff",
          }}
        >
          {bloqueado ? (
            <Lock size={12} className="text-gray" aria-label="Tópico bloqueado" />
          ) : aprovado ? (
            <Check size={14} strokeWidth={3} className="text-white" aria-label="Tópico aprovado" />
          ) : (
            <span className="size-2 rounded-full" style={{ backgroundColor: cor }} />
          )}
        </div>

        {!ultimo && (
          <div
            className="relative mt-1 min-h-6 w-[3px] flex-1 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-label={`Progresso do tópico ${tema.titulo}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentual}
          >
            <div
              className="absolute inset-x-0 top-0 rounded-full transition-all duration-500"
              style={{ height: `${percentual}%`, backgroundColor: cor }}
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 pb-6">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gray">Capítulo {numero}</p>
        <p
          className={`mt-0.5 font-display text-[14px] font-semibold leading-snug ${
            bloqueado ? "text-gray" : "text-charcoal"
          }`}
        >
          {tema.titulo}
        </p>
        <p className="mt-0.5 text-[11.5px] text-gray">
          {bloqueado
            ? "Seja aprovado no capítulo anterior para desbloquear"
            : `${concluidos} de ${total} ${total === 1 ? "módulo concluído" : "módulos concluídos"}`}
        </p>

        {!bloqueado && (
          <div className="mt-2 flex flex-col gap-0.5">
            {total === 0 && <p className="text-[11.5px] text-gray">Gerando módulos...</p>}
            {tema.modulos.map((modulo, indice) => {
              const ativo = modulo.id === moduloSelecionadoId;
              return (
                <button
                  key={modulo.id}
                  type="button"
                  onClick={() => onSelecionarModulo(modulo.id)}
                  aria-current={ativo ? "true" : undefined}
                  className={`flex items-start gap-2 rounded-[6px] px-2 py-1.5 text-left text-[13px] leading-snug transition ${
                    ativo ? "bg-orange/10 font-medium text-orange" : "text-charcoal hover:bg-surface"
                  }`}
                >
                  <span className="mt-px min-w-7 shrink-0 font-display text-[11px] tabular-nums text-gray">
                    {numero}.{indice + 1}
                  </span>
                  <span className="min-w-0 flex-1 break-words">{modulo.titulo}</span>
                  <span className="mt-1 flex shrink-0 items-center gap-1.5">
                    {modulosLidos.includes(modulo.id) && (
                      <BookOpenCheck size={13} className="shrink-0 text-orange" aria-label="Lido" />
                    )}
                    <IndicadorQuiz estado={estadosModulos[modulo.id]} />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}