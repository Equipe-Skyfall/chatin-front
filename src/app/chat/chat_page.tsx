"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use_chat";
import { ChatComposer } from "@/components/chat_components/chat_composer";
import { ChatMessages } from "@/components/chat_components/chat_messages";
import { ConversationList } from "@/components/chat_components/conversation_list";
import { ModuleSelector } from "@/components/chat_components/module_selector";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";

export default function ChatPage() {
  const {
    admin,
    messages,
    sendMessage,
    conversas,
    conversaId,
    conversaAtual,
    abrirConversa,
    iniciarConversa,
    materias,
    materiaId,
    temaId,
    moduloId,
    selecionarMateria,
    selecionarTema,
    selecionarModulo,
    carregandoConversas,
    carregandoTrilha,
    carregandoHistorico,
    enviando,
  } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, enviando, conversaId, carregandoHistorico]);

  return (
    <main className="flex h-dvh overflow-hidden bg-surface">
      <Sidenav />
      <ConversationList
        conversas={conversas}
        conversaId={conversaId}
        carregando={carregandoConversas}
        onSelecionar={abrirConversa}
        onNova={iniciarConversa}
      />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="CHATin" subtitle={conversaAtual?.titulo || "Assistente de estudos"} />
        <div className="flex items-center justify-between border-b border-line bg-white px-4 py-2 lg:hidden">
          <span className="truncate text-[10px] text-gray">{conversaAtual?.titulo || "Nova conversa"}</span>
          <button type="button" onClick={iniciarConversa} className="shrink-0 text-[10px] font-semibold text-orange">
            Nova conversa
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            {!admin && conversaId === null && messages.length === 0 && (
              <ModuleSelector
                materias={materias}
                materiaId={materiaId}
                temaId={temaId}
                moduloId={moduloId}
                carregando={carregandoTrilha}
                onSelecionarMateria={selecionarMateria}
                onSelecionarTema={selecionarTema}
                onSelecionarModulo={selecionarModulo}
              />
            )}
            <ChatMessages messages={messages} carregando={carregandoHistorico} enviando={enviando} />
          </div>
          <ChatComposer onSend={sendMessage} />
        </div>
      </section>
    </main>
  );
}
