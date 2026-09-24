"use client";

import { useSyncExternalStore } from "react";
import type { TrilhaMateria } from "@/interfaces/chat_interfaces";

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

interface TrilhaSelectorProps {
  materias: TrilhaMateria[];
  carregando: boolean;
  onSelecionarModulo: (id: string) => void;
}

const subscribeNada = () => () => {};

/** `false` no SSR e no primeiro render do cliente, `true` só depois de
 * hidratar - mesma técnica do antigo ModuleSelector, pra não divergir
 * entre servidor e cliente no primeiro paint. */
function useMontado(): boolean {
  return useSyncExternalStore(
    subscribeNada,
    () => true,
    () => false
  );
}

export function TrilhaSelector({ materias, carregando, onSelecionarModulo }: TrilhaSelectorProps) {
  const montado = useMontado();

  return (
    <section className="mx-auto w-full px-4 pt-5 sm:px-7">
      <div className="rounded-xl bg-white px-4 py-4 shadow-neo-raised">
        <h2 className="font-display text-sm font-semibold text-charcoal">Contexto do estudo</h2>
        <p className="mt-1 text-[13px] leading-4 text-gray">
          Escolha um módulo para ancorar as respostas da IA no conteúdo dele. Você também pode conversar sem módulo.
        </p>

        {montado && carregando && <p className="mt-4 text-sm text-gray">Carregando trilha...</p>}

        {montado && !carregando && materias.length === 0 && (
          <p className="mt-4 text-sm text-gray">Nenhuma matéria disponível ainda.</p>
        )}

        {montado && !carregando && materias.length > 0 && (
          <div className="mt-4 flex flex-col gap-5">
            {materias.map((materia) => (
              <div key={materia.id}>
                <h3 className="font-display mb-2 text-sm font-semibold text-charcoal">{materia.nome}</h3>
                {materia.temas.map((tema) => (
                  <div key={tema.id} className="mb-3">
                    <p className="mb-1.5 text-[11px] uppercase tracking-wide text-gray">
                      {tema.titulo}
                      {tema.estado === "bloqueado" ? " (bloqueado)" : ""}
                    </p>
                    <div className="flex flex-col gap-2">
                      {tema.modulos.map((modulo) => (
                        <div
                          key={modulo.id}
                          className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-neo-raised"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-charcoal">{modulo.titulo}</span>
                            <span
                              className={`rounded-full px-3 py-1 text-[12px] font-semibold shadow-neo-inset-sm ${ESTADO_CLASSES[modulo.estado]}`}
                            >
                              {ESTADO_LABEL[modulo.estado]}
                            </span>
                          </div>
                          {modulo.estado !== "bloqueado" && (
                            <button
                              onClick={() => onSelecionarModulo(modulo.id)}
                              className="rounded-md bg-orange px-3 py-1.5 text-xs font-semibold text-white shadow-neo-raised-sm transition active:shadow-neo-inset-sm"
                            >
                              Conversar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
