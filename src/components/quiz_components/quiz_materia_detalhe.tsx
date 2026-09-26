"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TrilhaView } from "@/components/quiz_components/trilha_view";
import { QuizRunner } from "@/components/quiz_components/quiz_runner";
import { QuizResultado } from "@/components/quiz_components/quiz_resultado";
import { resumoTrilhaMateria } from "@/components/quiz_components/trilha_resumo";
import type { TentativaIniciar, TentativaResultado, TrilhaMateria } from "@/schemas/quiz";

interface QuizMateriaDetalheProps {
  materia: TrilhaMateria | null;
  highlightModuloId?: string | null;
  moduloTitulo: string | null;
  tentativa: TentativaIniciar | null;
  resultado: TentativaResultado | null;
  carregandoQuiz: boolean;
  erro?: string | null;
  onPraticar: (moduloId: string, titulo: string) => void;
  onConcluir: (moduloId: string, titulo: string) => void;
  onResponder: (respostas: Record<string, string>) => void;
  onVoltarAoModulos: () => void;
  onClose: () => void;
}

export function QuizMateriaDetalhe({
  materia,
  highlightModuloId,
  moduloTitulo,
  tentativa,
  resultado,
  carregandoQuiz,
  erro,
  onPraticar,
  onConcluir,
  onResponder,
  onVoltarAoModulos,
  onClose,
}: QuizMateriaDetalheProps) {
  const [saidaPendente, setSaidaPendente] = useState<"fechar" | "modulos" | null>(null);

  function tentarFechar() {
    if (tentativa) {
      setSaidaPendente("fechar");
      return;
    }
    onClose();
  }

  function tentarVoltar() {
    if (tentativa) {
      setSaidaPendente("modulos");
      return;
    }
    onVoltarAoModulos();
  }

  function confirmarSaida() {
    const acao = saidaPendente;
    setSaidaPendente(null);
    if (acao === "modulos") onVoltarAoModulos();
    else onClose();
  }

  useEffect(() => {
    if (!materia) return;

    function aoTeclar(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (tentativa) setSaidaPendente("fechar");
      else onClose();
    }

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [materia, onClose, tentativa]);

  useEffect(() => {
    if (!tentativa) return;

    function aoSair(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", aoSair);
    return () => window.removeEventListener("beforeunload", aoSair);
  }, [tentativa]);

  if (!materia) return null;

  const { temas, totalModulos, modulosConcluidos } = resumoTrilhaMateria(materia);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-materia-titulo"
      onClick={tentarFechar}
    >
      <div
        className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[16px] bg-white shadow-neo-raised"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2 id="quiz-materia-titulo" className="truncate font-display text-base font-semibold text-charcoal">
              {materia.nome}
            </h2>
            <p className="text-[12px] text-gray">
              {temas} {temas === 1 ? "tópico" : "tópicos"} · {modulosConcluidos} de {totalModulos} módulos concluídos
            </p>
          </div>
          <button
            type="button"
            onClick={tentarFechar}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-gray transition-colors hover:bg-orange/10 hover:text-orange"
          >
            <X size={18} />
          </button>
        </header>

        <div className="overflow-y-auto px-8 py-5">
          {erro && (
            <div className="mb-4 rounded-md bg-[#F26753]/10 px-3 py-2 text-[12px] text-[#a83f2e]">{erro}</div>
          )}

          {resultado ? (
            <QuizResultado
              moduloTitulo={moduloTitulo ?? materia.nome}
              resultado={resultado}
              onVoltar={onVoltarAoModulos}
            />
          ) : tentativa ? (
            <QuizRunner
              moduloTitulo={moduloTitulo ?? materia.nome}
              tentativa={tentativa}
              onEnviar={onResponder}
              onVoltar={tentarVoltar}
            />
          ) : carregandoQuiz ? (
            <p className="text-[13px] text-gray">Preparando questionário...</p>
          ) : (
            <TrilhaView
              trilha={{ materias: [materia] }}
              onPraticar={onPraticar}
              onConcluir={onConcluir}
              highlightModuloId={highlightModuloId}
              mostrarTituloMateria={false}
            />
          )}
        </div>
      </div>

      {saidaPendente && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="w-full max-w-3xl rounded-[16px] bg-white p-5 shadow-neo-raised">
            <h3 className="font-display text-md font-semibold text-charcoal">Sair do questionário?</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-gray">
              Você tem respostas não enviadas. Se sair agora, elas serão perdidas. Tem certeza de que deseja sair?
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setSaidaPendente(null)}
                className="rounded-[10px] bg-orange px-4 py-2 text-[12px] font-semibold text-white shadow-neo-raised-sm transition hover:bg-orange-light active:shadow-neo-inset-sm"
              >
                Continuar respondendo
              </button>
              <button
                type="button"
                onClick={confirmarSaida}
                className="rounded-[10px] border border-line px-4 py-2 text-[12px] font-semibold text-gray transition-colors hover:border-orange hover:text-orange"
              >
                Sair mesmo assim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
