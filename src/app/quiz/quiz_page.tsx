"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { getTrilha, gerarQuestionarioPersonalizado, iniciarTentativaModulo, responderTentativa } from "@/lib/quizApi";
import { useXpTracker } from "@/hooks/use_xp_tracker";
import type { Trilha, TentativaIniciar, TentativaResultado } from "@/schemas/quiz";
import { ApiError } from "@/lib/api";
import { QuizMateriaCard } from "@/components/quiz_components/quiz_materia_card";
import { QuizMateriaDetalhe } from "@/components/quiz_components/quiz_materia_detalhe";

export default function QuizPage() {
  const searchParams = useSearchParams();
  const highlightModuloId = searchParams.get("highlight");

  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [materiaAbertaId, setMateriaAbertaId] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState<TentativaIniciar | null>(null);
  const [resultado, setResultado] = useState<TentativaResultado | null>(null);
  const [moduloTitulo, setModuloTitulo] = useState<string | null>(null);
  const [carregandoQuiz, setCarregandoQuiz] = useState(false);
  const { executarComGanhoXp } = useXpTracker();

  useEffect(() => {
    getTrilha()
      .then((dados) => {
        setTrilha(dados);
        if (highlightModuloId) {
          const alvo = dados.materias.find((materia) =>
            materia.temas.some((tema) => tema.modulos.some((modulo) => modulo.id === highlightModuloId))
          );
          if (alvo) setMateriaAbertaId(alvo.id);
        }
      })
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Falha ao carregar trilha"))
      .finally(() => setCarregando(false));
  }, [highlightModuloId]);

  const materiaAberta = useMemo(
    () => trilha?.materias.find((materia) => materia.id === materiaAbertaId) ?? null,
    [trilha, materiaAbertaId]
  );

  const fecharDetalhe = useCallback(() => {
    setMateriaAbertaId(null);
    setTentativa(null);
    setResultado(null);
    setModuloTitulo(null);
  }, []);

  const voltarAoModulos = useCallback(() => {
    setTentativa(null);
    setResultado(null);
    setModuloTitulo(null);
  }, []);

  function abrirMateria(id: string) {
    setMateriaAbertaId(id);
    setTentativa(null);
    setResultado(null);
    setModuloTitulo(null);
    setErro(null);
  }

  async function iniciarQuiz(buscar: () => Promise<TentativaIniciar>, titulo: string) {
    setErro(null);
    setResultado(null);
    setModuloTitulo(titulo);
    setCarregandoQuiz(true);
    try {
      setTentativa(await buscar());
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao carregar questionário");
    } finally {
      setCarregandoQuiz(false);
    }
  }

  function praticar(moduloId: string, titulo: string) {
    return iniciarQuiz(() => gerarQuestionarioPersonalizado(moduloId), titulo);
  }

  function concluirModulo(moduloId: string, titulo: string) {
    return iniciarQuiz(() => iniciarTentativaModulo(moduloId), titulo);
  }

  async function responder(respostas: Record<string, string>) {
    if (!tentativa) return;

    setErro(null);
    setCarregandoQuiz(true);
    try {
      const payload = Object.entries(respostas).map(([questao_id, resposta_escolhida]) => ({
        questao_id,
        resposta_escolhida,
      }));

      const enviar = () => responderTentativa(tentativa.tentativa_id, payload);
      const r = tentativa.pratica ? await enviar() : await executarComGanhoXp(enviar);

      setTentativa(null);
      setResultado(r);
      getTrilha()
        .then(setTrilha)
        .catch(() => {});
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao enviar respostas");
    } finally {
      setCarregandoQuiz(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Questionários" subtitle="Pratique ou conclua um módulo" />
        <div className="mx-auto w-full flex-1 px-4 py-6 sm:px-7">
          {erro && !materiaAberta && (
            <div className="mb-4 rounded-md bg-[#F26753]/10 px-4 py-3 text-sm text-[#a83f2e]">
              {erro}
            </div>
          )}
          {carregando && <p className="mb-4 text-sm text-gray text-center">Carregando questionários...</p>}

          {!carregando && trilha && trilha.materias.length === 0 && (
            <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
              <h2 className="font-display text-sm font-semibold text-charcoal">Nenhuma matéria disponível ainda</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-gray">
                Assim que houver conteúdo cadastrado, os questionários aparecem aqui.
              </p>
            </div>
          )}

          {trilha && trilha.materias.length > 0 && (
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[15px] font-semibold text-charcoal">Suas matérias</h2>
                <span className="text-[11.5px] text-gray">{trilha.materias.length} no total</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {trilha.materias.map((materia) => (
                  <QuizMateriaCard
                    key={materia.id}
                    materia={materia}
                    onAbrir={() => abrirMateria(materia.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {materiaAberta && (
        <QuizMateriaDetalhe
          materia={materiaAberta}
          highlightModuloId={highlightModuloId}
          moduloTitulo={moduloTitulo}
          tentativa={tentativa}
          resultado={resultado}
          carregandoQuiz={carregandoQuiz}
          erro={erro}
          onPraticar={praticar}
          onConcluir={concluirModulo}
          onResponder={responder}
          onVoltarAoModulos={voltarAoModulos}
          onClose={fecharDetalhe}
        />
      )}
    </main>
  );
}
