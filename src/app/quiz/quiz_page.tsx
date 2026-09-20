"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { isAuthenticated } from "@/lib/auth";
import { getTrilha, gerarQuestionarioPersonalizado, iniciarTentativaModulo, responderTentativa } from "@/lib/quizApi";
import type { Trilha, TentativaIniciar, TentativaResultado } from "@/schemas/quiz";
import { ApiError } from "@/lib/api";
import Link from "next/link";

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

function TrilhaView({
  trilha,
  onPraticar,
  onConcluir,
}: {
  trilha: Trilha | null;
  onPraticar: (moduloId: string, titulo: string) => void;
  onConcluir: (moduloId: string, titulo: string) => void;
}) {
  if (!trilha) return null;
  if (trilha.materias.length === 0) {
    return <p className="text-sm text-gray">Nenhuma matéria disponível ainda.</p>;
  }
  return (
    <div className="flex flex-col gap-5">
      {trilha.materias.map((materia) => (
        <div key={materia.id}>
          <h2 className="font-display mb-2 text-sm font-semibold text-charcoal">{materia.nome}</h2>
          {materia.temas.map((tema) => (
            <div key={tema.id} className="mb-3">
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-gray">{tema.titulo}</p>
              <div className="flex flex-col gap-2">
                {tema.modulos.map((modulo) => (
                  <div
                    key={modulo.id}
                    className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-neo-raised"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-charcoal">{modulo.titulo}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ESTADO_CLASSES[modulo.estado]}`}
                      >
                        {ESTADO_LABEL[modulo.estado]}
                      </span>
                    </div>
                    {modulo.estado !== "bloqueado" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onPraticar(modulo.id, modulo.titulo)}
                          className="rounded-md bg-surface px-3 py-1.5 text-xs font-semibold text-orange shadow-neo-raised-sm transition active:shadow-neo-inset-sm"
                        >
                          Praticar
                        </button>
                        <button
                          onClick={() => onConcluir(modulo.id, modulo.titulo)}
                          className="rounded-md bg-orange px-3 py-1.5 text-xs font-semibold text-white shadow-neo-raised-sm transition active:shadow-neo-inset-sm"
                        >
                          Concluir (vale XP)
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function QuizRunner({
  moduloTitulo,
  tentativa,
  onEnviar,
  onVoltar,
}: {
  moduloTitulo: string;
  tentativa: TentativaIniciar;
  onEnviar: (respostas: Record<string, string>) => void;
  onVoltar: () => void;
}) {
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const todasRespondidas = tentativa.questoes.every((q) => respostas[q.id]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray">{moduloTitulo}</p>
          <h2 className="font-display text-sm font-semibold text-charcoal">
            {tentativa.pratica ? "Questionário de prática" : "Questionário de conclusão (vale XP)"}
          </h2>
        </div>
        <button onClick={onVoltar} className="text-xs text-gray underline">
          voltar
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {tentativa.questoes.map((q, idx) => (
          <div key={q.id} className="rounded-xl bg-surface p-4 shadow-neo-raised">
            <p className="mb-1 text-[10px] uppercase tracking-wide text-gray">
              Múltipla escolha · questão {idx + 1}
            </p>
            <p className="mb-3 text-sm font-medium text-charcoal">{q.enunciado}</p>
            <div className="flex flex-col gap-2">
              {q.alternativas.map((alt) => (
                <label
                  key={alt.letra}
                  className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                    respostas[q.id] === alt.letra
                      ? "border-orange/40 bg-orange/10"
                      : "border-line bg-surface"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={alt.letra}
                    checked={respostas[q.id] === alt.letra}
                    onChange={() => setRespostas((r) => ({ ...r, [q.id]: alt.letra }))}
                    className="mt-0.5"
                  />
                  <span>
                    <strong>{alt.letra})</strong> {alt.texto}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!todasRespondidas}
        onClick={() => onEnviar(respostas)}
        className="mt-5 w-full rounded-md bg-orange px-4 py-2.5 text-sm font-semibold text-white shadow-neo-raised-sm transition active:shadow-neo-inset-sm disabled:opacity-40"
      >
        Enviar respostas
      </button>
    </div>
  );
}

function QuizResultado({
  moduloTitulo,
  resultado,
  onVoltar,
}: {
  moduloTitulo: string;
  resultado: TentativaResultado;
  onVoltar: () => void;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray">{moduloTitulo}</p>
      <h2 className="font-display mb-1 text-lg font-semibold text-charcoal">
        {resultado.pontuacao.toFixed(0)}% · {resultado.total_corretas}/{resultado.total_questoes} corretas
      </h2>
      <button onClick={onVoltar} className="mb-4 text-xs text-gray underline">
        voltar pra trilha
      </button>

      <div className="flex flex-col gap-3">
        {resultado.resultados.map((r, idx) => (
          <div
            key={r.questao_id}
            className={`rounded-xl p-4 ${r.correta ? "bg-[#DDE9C5]/40" : "bg-[#F26753]/10"}`}
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide">
              Questão {idx + 1} · {r.correta ? "Você acertou ✅" : "Você errou ❌"}
            </p>
            <p className="text-sm text-charcoal">
              Sua resposta: <strong>{r.resposta_escolhida}</strong> · Gabarito:{" "}
              <strong>{r.resposta_correta}</strong>
            </p>
            {r.explicacao && <p className="mt-1 text-xs text-gray">{r.explicacao}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
