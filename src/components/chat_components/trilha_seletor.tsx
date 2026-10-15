"use client";

import { useState } from "react";
import { MotionConfig } from "motion/react";
import { BookOpen, MessageCircle } from "lucide-react";
import { SubjectIconBadge } from "@/components/progresso_components/subject_icon";
import { TrilhaTemaCaminho } from "@/components/quiz_components/trilha_tema_caminho";
import { resumoTrilhaMateria } from "@/components/quiz_components/trilha_resumo";
import type { TrilhaMateria } from "@/interfaces/chat_interfaces";

interface TrilhaSeletorProps {
  materias: TrilhaMateria[];
  carregando: boolean;
  /** Toque no ▶ de um módulo: abre a leitura desse módulo na apostila. */
  onIniciar: (materiaId: string, temaId: string, moduloId: string) => void;
  /** Segue para o chat sem trilha/módulo. */
  onSeguirSemTema: () => void;
}

/** Tela de contexto que ocupa o lugar do chat antes da primeira mensagem:
 * escolhe a trilha e o módulo no caminho; o ▶ leva o aluno direto para a
 * leitura do módulo escolhido na apostila. O chat abre em "Seguir sem tema". */
export function TrilhaSeletor({ materias, carregando, onIniciar, onSeguirSemTema }: TrilhaSeletorProps) {
  const [materiaVisivelId, setMateriaVisivelId] = useState<string | null>(null);
  const materiaVisivel = materias.find((materia) => materia.id === materiaVisivelId);

  return (
    <section className="mx-auto flex min-h-full w-full flex-col px-4 pt-5 sm:px-7">
      <div className="rounded-xl bg-white px-4 py-4 shadow-neo-raised">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-[8px] bg-orange/10 text-orange">
            <BookOpen size={15} />
          </span>
          <h2 className="font-display text-sm font-semibold text-charcoal">Contexto do estudo</h2>
        </div>
        <p className="mt-2 text-[13px] leading-4 text-gray">
          Escolha uma trilha e toque no ▶ de um módulo para abrir a leitura dele na apostila. Se preferir, siga direto
          para o chat sem tema.
        </p>

        {carregando ? (
          <p className="mt-4 text-[13px] text-gray">Carregando trilha...</p>
        ) : materias.length === 0 ? (
          <p className="mt-4 text-[13px] text-gray">Nenhuma matéria disponível ainda. Você pode seguir sem tema.</p>
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
                  2. Toque no ▶ para estudar em {materiaVisivel.nome}
                </p>
                <div className="mt-2 flex flex-col gap-5">
                  {materiaVisivel.temas.map((tema, indice) => (
                    <TrilhaTemaCaminho
                      key={`${materiaVisivel.id}-${tema.id}`}
                      tema={tema}
                      indice={indice}
                      aoIniciarModulo={(modulo) => onIniciar(materiaVisivel.id, tema.id, modulo.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </MotionConfig>
        )}
      </div>

      <div className="sticky bottom-0 mt-auto flex justify-center py-4">
        <button
          type="button"
          onClick={onSeguirSemTema}
          className="flex items-center gap-2 rounded-full bg-orange px-6 py-2.5 text-[13px] font-semibold text-white shadow-neo-raised-sm transition hover:bg-orange-light focus-visible:ring-4 focus-visible:ring-orange/30 focus-visible:outline-none active:shadow-neo-inset-sm"
        >
          <MessageCircle size={15} />
          Seguir sem tema
        </button>
      </div>
    </section>
  );
}
