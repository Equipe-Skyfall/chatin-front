"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { getTrilha, gerarQuestionarioPersonalizado, iniciarTentativaModulo, responderTentativa } from "@/lib/quizApi";
import { useXpTracker } from "@/hooks/use_xp_tracker";
import type { Trilha, TentativaIniciar, TentativaResultado } from "@/schemas/quiz";
import { ApiError } from "@/lib/api";
import { TrilhaView } from "@/components/quiz_components/trilha_view";
import { QuizRunner } from "@/components/quiz_components/quiz_runner";
import { QuizResultado } from "@/components/quiz_components/quiz_resultado";

type Tela =
  | { tipo: "hub" }
  | { tipo: "respondendo"; moduloTitulo: string; tentativa: TentativaIniciar }
  | { tipo: "resultado"; moduloTitulo: string; resultado: TentativaResultado };

export default function QuizPage() {
  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tela, setTela] = useState<Tela>({ tipo: "hub" });
  const { executarComGanhoXp } = useXpTracker();

  useEffect(() => {
    getTrilha()
      .then(setTrilha)
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Falha ao carregar trilha"))
      .finally(() => setCarregando(false));
  }, []);

  async function praticar(moduloId: string, moduloTitulo: string) {
    setErro(null);
    setCarregando(true);
    try {
      const tentativa = await gerarQuestionarioPersonalizado(moduloId);
      setTela({ tipo: "respondendo", moduloTitulo, tentativa });
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao gerar questionário");
    } finally {
      setCarregando(false);
    }
  }

  async function concluirModulo(moduloId: string, moduloTitulo: string) {
    setErro(null);
    setCarregando(true);
    try {
      const tentativa = await iniciarTentativaModulo(moduloId);
      setTela({ tipo: "respondendo", moduloTitulo, tentativa });
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao iniciar questionário");
    } finally {
      setCarregando(false);
    }
  }

  async function enviarRespostas(
    moduloTitulo: string,
    tentativaId: string,
    respostas: Record<string, string>,
    pratica: boolean
  ) {
    setErro(null);
    setCarregando(true);
    try {
      const payload = Object.entries(respostas).map(([questao_id, resposta_escolhida]) => ({
        questao_id,
        resposta_escolhida,
      }));

      const enviar = () => responderTentativa(tentativaId, payload);
      const resultado = pratica ? await enviar() : await executarComGanhoXp(enviar);

      setTela({ tipo: "resultado", moduloTitulo, resultado });
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao enviar respostas");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Questionários" subtitle="Pratique ou conclua um módulo" />
        <div className="mx-auto w-full flex-1 px-4 py-6 sm:px-7">
          {erro && (
            <div className="mb-4 rounded-md bg-[#F26753]/10 px-4 py-3 text-sm text-[#a83f2e]">
              {erro}
            </div>
          )}
          {carregando && <p className="mb-4 text-sm text-gray text-center">Carregando questionários...</p>}

          {tela.tipo === "hub" && (
            <TrilhaView trilha={trilha} onPraticar={praticar} onConcluir={concluirModulo} />
          )}
          {tela.tipo === "respondendo" && (
            <QuizRunner
              moduloTitulo={tela.moduloTitulo}
              tentativa={tela.tentativa}
              onEnviar={(respostas) =>
                enviarRespostas(
                  tela.moduloTitulo,
                  tela.tentativa.tentativa_id,
                  respostas,
                  tela.tentativa.pratica
                )
              }
              onVoltar={() => setTela({ tipo: "hub" })}
            />
          )}
          {tela.tipo === "resultado" && (
            <QuizResultado
              moduloTitulo={tela.moduloTitulo}
              resultado={tela.resultado}
              onVoltar={() => setTela({ tipo: "hub" })}
            />
          )}
        </div>
      </section>
    </main>
  );
}
