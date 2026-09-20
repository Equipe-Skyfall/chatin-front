"use client";

import { useEffect, useState } from "react";
import { useChat } from "@/hooks/use_chat";
import { ChatComposer } from "@/components/chat_components/chat_composer";
import { ChatMessages } from "@/components/chat_components/chat_messages";
import { TrilhaPicker } from "@/components/chat_components/trilha_picker";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { isAuthenticated } from "@/lib/auth";
import { entrarModoTeste } from "@/lib/devLogin";
import { getTrilha } from "@/lib/quizApi";
import type { Trilha } from "@/schemas/quiz";
import { ApiError } from "@/lib/api";

type Tela =
  | { tipo: "escolher" }
  | { tipo: "conversando"; moduloId: string; materiaNome: string; temaTitulo: string; moduloTitulo: string };

export default function ChatPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [erroTrilha, setErroTrilha] = useState<string | null>(null);
  const [tela, setTela] = useState<Tela>({ tipo: "escolher" });

  useEffect(() => {
    setAutenticado(isAuthenticated());
  }, []);

  useEffect(() => {
    if (!autenticado) return;
    getTrilha()
      .then(setTrilha)
      .catch((e) => setErroTrilha(e instanceof ApiError ? e.message : "Falha ao carregar trilha"));
  }, [autenticado]);

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        {!autenticado ? (
          <>
            <AppHeader title="CHATin" />
            <div className="mx-auto w-full max-w-[520px] flex-1 px-4 py-6 sm:px-7">
              <div className="rounded-xl bg-surface p-6 text-center shadow-neo-raised">
                <p className="mb-4 text-sm text-gray">
                  Modo de teste local - sem login de verdade, só pra testar contra o backend rodando em{" "}
                  <code className="text-charcoal">localhost:8000</code>.
                </p>
                <button
                  onClick={entrarModoTeste}
                  className="rounded-md bg-orange px-4 py-2 text-sm font-semibold text-white shadow-neo-raised-sm transition active:shadow-neo-inset-sm"
                >
                  Entrar como aluno de teste
                </button>
              </div>
            </div>
          </>
        ) : tela.tipo === "escolher" ? (
          <>
            <AppHeader title="CHATin" subtitle="Escolha o módulo que você quer estudar" />
            <div className="mx-auto w-full max-w-[720px] flex-1 px-4 py-6 sm:px-7">
              {erroTrilha && (
                <div className="mb-4 rounded-md bg-[#F26753]/10 px-4 py-3 text-sm text-[#a83f2e]">{erroTrilha}</div>
              )}
              <TrilhaPicker
                trilha={trilha}
                onEscolherModulo={(moduloId, contexto) => setTela({ tipo: "conversando", moduloId, ...contexto })}
              />
            </div>
          </>
        ) : (
          <ConversaView
            key={tela.moduloId}
            moduloId={tela.moduloId}
            subtitulo={`${tela.materiaNome} › ${tela.temaTitulo} › ${tela.moduloTitulo}`}
            onTrocarModulo={() => setTela({ tipo: "escolher" })}
          />
        )}
      </section>
    </main>
  );
}

function ConversaView({
  moduloId,
  subtitulo,
  onTrocarModulo,
}: {
  moduloId: string;
  subtitulo: string;
  onTrocarModulo: () => void;
}) {
  const { messages, sendMessage, erro } = useChat(moduloId);

  return (
    <>
      <AppHeader title="CHATin" subtitle={subtitulo} />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex justify-end px-4 pt-3 sm:px-7">
          <button onClick={onTrocarModulo} className="text-xs text-orange underline">
            Trocar módulo
          </button>
        </div>
        {erro && <div className="mx-4 mt-3 rounded-md bg-[#F26753]/10 px-4 py-3 text-sm text-[#a83f2e] sm:mx-7">{erro}</div>}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ChatMessages messages={messages} />
        </div>
        <ChatComposer onSend={sendMessage} />
      </div>
    </>
  );
}
