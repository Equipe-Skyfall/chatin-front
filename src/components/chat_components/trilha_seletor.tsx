"use client";

import { useState } from "react";
import { MotionConfig } from "motion/react";
import { BookOpen, X } from "lucide-react";
import { TrilhaModuloEscolha } from "@/components/chat_components/trilha_modulo_escolha";
import { TrilhaTemaCaminho } from "@/components/quiz_components/trilha_tema_caminho";
import type { TrilhaMateria } from "@/interfaces/chat_interfaces";

interface TrilhaSeletorProps {
  materias: TrilhaMateria[];
  moduloId: string | null;
  carregando: boolean;
  onSelecionar: (materiaId: string, temaId: string, moduloId: string) => void;
  onLimpar: () => void;
}

/** Escolha do módulo que ancora a conversa, mostrada antes da primeira
 * mensagem: a mesma trilha em caminho da tela de Questionários, onde clicar
 * num nó oferece "Conversar sobre este módulo". */
export function TrilhaSeletor({ materias, moduloId, carregando, onSelecionar, onLimpar }: TrilhaSeletorProps) {
  const [materiaVisivelId, setMateriaVisivelId] = useState<string | null>(null);

  const materiaVisivel = materias.find((materia) => materia.id === materiaVisivelId) ?? materias[0];
  const tituloEscolhido = materias
    .flatMap((materia) => materia.temas)
    .flatMap((tema) => tema.modulos)
    .find((modulo) => modulo.id === moduloId)?.titulo;

  return (
    <section className="mx-auto w-full px-4 pt-5 sm:px-7">
      <div className="rounded-xl bg-white px-4 py-4 shadow-neo-raised">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-[8px] bg-orange/10 text-orange">
            <BookOpen size={15} />
          </span>
          <h2 className="font-display text-sm font-semibold text-charcoal">Contexto do estudo</h2>
        </div>
        <p className="mt-2 text-[13px] leading-4 text-gray">
          Escolha um módulo na trilha para ancorar as respostas da IA no conteúdo dele. Você também pode conversar sem
          módulo.
        </p>

        {tituloEscolhido && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-[10px] bg-orange/10 px-3 py-2">
            <p className="min-w-0 truncate text-[12.5px] text-charcoal">
              Módulo: <span className="font-semibold">{tituloEscolhido}</span>
            </p>
            <button
              type="button"
              onClick={onLimpar}
              aria-label="Conversar sem módulo"
              className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-orange"
            >
              <X size={13} />
              Remover
            </button>
          </div>
        )}

        {carregando ? (
          <p className="mt-4 text-[13px] text-gray">Carregando trilha...</p>
        ) : !materiaVisivel ? (
          <p className="mt-4 text-[13px] text-gray">Nenhuma matéria disponível ainda. Você pode conversar sem módulo.</p>
        ) : (
          <MotionConfig reducedMotion="user">
            {materias.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Matérias">
                {materias.map((materia) => (
                  <button
                    key={materia.id}
                    type="button"
                    role="tab"
                    aria-selected={materia.id === materiaVisivel.id}
                    onClick={() => setMateriaVisivelId(materia.id)}
                    className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                      materia.id === materiaVisivel.id
                        ? "bg-orange text-white"
                        : "bg-surface text-gray hover:text-charcoal"
                    }`}
                  >
                    {materia.nome}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 flex flex-col gap-5">
              {materiaVisivel.temas.map((tema, indice) => (
                <TrilhaTemaCaminho
                  key={`${materiaVisivel.id}-${tema.id}`}
                  tema={tema}
                  indice={indice}
                  highlightModuloId={moduloId}
                  renderAcoes={(modulo, painelId) => (
                    <TrilhaModuloEscolha
                      key={modulo.id}
                      id={painelId}
                      titulo={modulo.titulo}
                      escolhido={modulo.id === moduloId}
                      onEscolher={() => onSelecionar(materiaVisivel.id, tema.id, modulo.id)}
                    />
                  )}
                />
              ))}
            </div>
          </MotionConfig>
        )}
      </div>
    </section>
  );
}
