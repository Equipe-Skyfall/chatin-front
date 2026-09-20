"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { TrilhaView } from "@/components/quiz_components/trilha_view";
import { QuizRunner } from "@/components/quiz_components/quiz_runner";
import { QuizResultado } from "@/components/quiz_components/quiz_resultado";
import { isAuthenticated } from "@/lib/auth";
import { getTrilha, gerarQuestionarioPersonalizado, iniciarTentativaModulo, responderTentativa } from "@/lib/quizApi";
import type { Trilha, TentativaIniciar, TentativaResultado } from "@/schemas/quiz";
import { ApiError } from "@/lib/api";

type Tela =
  | { tipo: "hub" }
  | { tipo: "respondendo"; moduloTitulo: string; tentativa: TentativaIniciar }
  | { tipo: "resultado"; moduloTitulo: string; resultado: TentativaResultado };

export default function QuizPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [tela, setTela] = useState<Tela>({ tipo: "hub" });

  useEffect(() => {
    setAutenticado(isAuthenticated());
  }, []);

  useEffect(() => {
    if (!autenticado) return;
    setCarregando(true);
    getTrilha()
      .then(setTrilha)
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Falha ao carregar trilha"))
      .finally(() => setCarregando(false));
  }, [autenticado]);

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
    respostas: Record<string, string>
  ) {
    setErro(null);
    setCarregando(true);
    try {
      const payload = Object.entries(respostas).map(([questao_id, resposta_escolhida]) => ({
        questao_id,
        resposta_escolhida,
      }));
      const resultado = await responderTentativa(tentativaId, payload);
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
        <div className="mx-auto w-full max-w-[720px] flex-1 px-4 py-6 sm:px-7">
          {!autenticado ? (
            <div className="rounded-xl bg-surface p-6 text-center shadow-neo-raised">
              <p className="mb-4 text-sm text-gray">Você precisa entrar na sua conta pra ver seus questionários.</p>
              <Link
                href="/Login"
                className="inline-block rounded-md bg-orange px-4 py-2 text-sm font-semibold text-white shadow-neo-raised-sm transition active:shadow-neo-inset-sm"
              >
                Fazer login
              </Link>
            </div>
          ) : (
            <>
              {erro && (
                <div className="mb-4 rounded-md bg-[#F26753]/10 px-4 py-3 text-sm text-[#a83f2e]">
                  {erro}
                </div>
              )}
              {carregando && <p className="mb-4 text-sm text-gray">Carregando...</p>}

              {tela.tipo === "hub" && (
                <TrilhaView trilha={trilha} onPraticar={praticar} onConcluir={concluirModulo} />
              )}
              {tela.tipo === "respondendo" && (
                <QuizRunner
                  moduloTitulo={tela.moduloTitulo}
                  tentativa={tela.tentativa}
                  onEnviar={(respostas) =>
                    enviarRespostas(tela.moduloTitulo, tela.tentativa.tentativa_id, respostas)
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
            </>
          )}
        </div>
      </section>
    </main>
  );
}
