"use client";

import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { useChat } from "@/hooks/use_chat";
import { ChatComposer } from "@/components/chat_components/chat_composer";
import { ChatMessages } from "@/components/chat_components/chat_messages";
import { ConversationList } from "@/components/chat_components/conversation_list";
import { ResumoEstudoButton } from "@/components/chat_components/resumo_estudo_button";
import { TrilhaSeletor } from "@/components/chat_components/trilha_seletor";
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
  const [conversasAberto, setConversasAberto] = useState(false);

  function selecionarConversa(id: string) {
    abrirConversa(id);
    setConversasAberto(false);
  }

  function novaConversa() {
    iniciarConversa();
    setConversasAberto(false);
  }

  function escolherModulo(materia: string, tema: string, modulo: string) {
    selecionarMateria(materia);
    selecionarTema(tema);
    selecionarModulo(modulo);
  }

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
        onSelecionar={selecionarConversa}
        onNova={novaConversa}
        aberto={conversasAberto}
        onFechar={() => setConversasAberto(false)}
      />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="CHATin" subtitle={conversaAtual?.titulo || "Assistente de estudos"} />
        {!admin && conversaAtual && (
          <div className="flex items-center justify-end border-b border-line bg-white px-4 py-2">
            <ResumoEstudoButton conversaId={conversaAtual.id} />
          </div>
        )}
        <div className="flex items-center justify-between border-b border-line bg-white px-4 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setConversasAberto(true)}
            className="flex items-center gap-2 text-[12px] font-semibold text-charcoal"
          >
            <Menu size={16} />
            Conversas
          </button>
          <button type="button" onClick={novaConversa} className="shrink-0 text-[12px] font-semibold text-orange">
            Nova conversa
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            {!admin && conversaId === null && messages.length === 0 && (
              <TrilhaSeletor
                materias={materias}
                moduloId={moduloId}
                carregando={carregandoTrilha}
                onSelecionar={escolherModulo}
                onLimpar={() => selecionarModulo(null)}
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
