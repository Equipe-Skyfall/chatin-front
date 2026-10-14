"use client";

import { useState } from "react";
import { MotionConfig } from "motion/react";
import { BookOpen, X } from "lucide-react";
import { TrilhaModuloEscolha } from "@/components/chat_components/trilha_modulo_escolha";
import { SubjectIconBadge } from "@/components/progresso_components/subject_icon";
import { TrilhaTemaCaminho } from "@/components/quiz_components/trilha_tema_caminho";
import { resumoTrilhaMateria } from "@/components/quiz_components/trilha_resumo";
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

  // Sem escolha explícita, abre a matéria do módulo já escolhido (se houver); senão só os cartões.
  const materiaDoModulo = materias.find((materia) =>
    materia.temas.some((tema) => tema.modulos.some((modulo) => modulo.id === moduloId))
  );
  const materiaVisivel = materias.find((materia) => materia.id === materiaVisivelId) ?? materiaDoModulo;
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
        ) : materias.length === 0 ? (
          <p className="mt-4 text-[13px] text-gray">Nenhuma matéria disponível ainda. Você pode conversar sem módulo.</p>
        ) : (
          <MotionConfig reducedMotion="user">
            <p className="mt-4 text-[11px] font-semibold tracking-wide text-gray uppercase">1. Escolha a trilha</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Trilhas">
              {materias.map((materia) => {
                const { temas, totalModulos, modulosConcluidos, percentual } = resumoTrilhaMateria(materia);
                const ativa = materia.id === materiaVisivel?.id;
                return (
                  <button
                    key={materia.id}
                    type="button"
                    aria-pressed={ativa}
                    onClick={() => setMateriaVisivelId(ativa ? null : materia.id)}
                    className={`flex flex-col gap-2 rounded-[12px] border bg-white p-3 text-left shadow-neo-raised-sm transition-[border-color,box-shadow] focus-visible:ring-4 focus-visible:ring-orange/20 focus-visible:outline-none ${
                      ativa ? "border-orange" : "border-line hover:border-orange/40"
                    }`}
                  >
                    <div className="flex w-full items-center gap-3">
                      <SubjectIconBadge nome={materia.nome} materiaId={materia.id} cor="#f2711c" size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-[13px] font-semibold text-charcoal">{materia.nome}</p>
                        <p className="text-[11px] text-gray">
                          {temas} {temas === 1 ? "tópico" : "tópicos"} · {totalModulos}{" "}
                          {totalModulos === 1 ? "módulo" : "módulos"}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full items-center gap-2">
                      <div
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
                        role="progressbar"
                        aria-label={`Progresso em ${materia.nome}`}
                        aria-valuenow={percentual}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div className="h-full rounded-full bg-orange" style={{ width: `${percentual}%` }} />
                      </div>
                      <span className="shrink-0 text-[11px] text-gray">
                        {modulosConcluidos}/{totalModulos}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {materiaVisivel && (
              <>
                <p className="mt-5 text-[11px] font-semibold tracking-wide text-gray uppercase">
                  2. Escolha o módulo em {materiaVisivel.nome}
                </p>
                <div className="mt-2 flex flex-col gap-5">
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
              </>
            )}
          </MotionConfig>
        )}
      </div>
    </section>
  );
}
