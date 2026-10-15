"use client";

import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChat } from "@/hooks/use_chat";
import { ChatComposer } from "@/components/chat_components/chat_composer";
import { ChatMessages } from "@/components/chat_components/chat_messages";
import { ConversationList } from "@/components/chat_components/conversation_list";
import { ResumoEstudoButton } from "@/components/chat_components/resumo_estudo_button";
import { TrilhaSeletor } from "@/components/chat_components/trilha_seletor";
import { resumoTrilhaMateria } from "@/components/quiz_components/trilha_resumo";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";

export default function ChatPage() {
  const router = useRouter();
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
    selecionarModulo,
    carregandoConversas,
    carregandoTrilha,
    carregandoHistorico,
    enviando,
  } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [conversasAberto, setConversasAberto] = useState(false);
  // A tela de contexto (trilha) ocupa o lugar do chat até o aluno tocar no ▶ de
  // um módulo (que abre a leitura dele na apostila) ou em "Seguir sem tema" (que abre o chat).
  const [iniciou, setIniciou] = useState(false);
  const mostrarContexto = !admin && conversaId === null && messages.length === 0 && !iniciou;

  const moduloAtualId = conversaAtual ? (conversaAtual.modulo_id ?? null) : iniciou ? moduloId : null;
  const materiaAtual = moduloAtualId
    ? materias.find((materia) =>
        materia.temas.some((tema) => tema.modulos.some((modulo) => modulo.id === moduloAtualId))
      )
    : undefined;
  const moduloAtual = materiaAtual?.temas
    .flatMap((tema) => tema.modulos)
    .find((modulo) => modulo.id === moduloAtualId);
  const resumoMateria = materiaAtual ? resumoTrilhaMateria(materiaAtual) : null;

  function selecionarConversa(id: string) {
    abrirConversa(id);
    setConversasAberto(false);
  }

  function novaConversa() {
    iniciarConversa();
    setIniciou(false);
    setConversasAberto(false);
  }

  function iniciarSessaoNoModulo(materia: string, _tema: string, modulo: string) {
    router.push(`/apostilas/${materia}?modulo=${modulo}`);
  }

  function seguirSemTema() {
    selecionarModulo(null);
    setIniciou(true);
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
        <AppHeader
          title={materiaAtual?.nome ?? "CHATin"}
          subtitle={moduloAtual?.titulo ?? (conversaAtual?.titulo || "Assistente de estudos")}
          progresso={
            resumoMateria
              ? {
                  percentual: resumoMateria.percentual,
                  concluidos: resumoMateria.modulosConcluidos,
                  total: resumoMateria.totalModulos,
                }
              : undefined
          }
        />
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
            {mostrarContexto ? (
              <TrilhaSeletor
                materias={materias}
                carregando={carregandoTrilha}
                onIniciar={iniciarSessaoNoModulo}
                onSeguirSemTema={seguirSemTema}
              />
            ) : (
              <ChatMessages messages={messages} carregando={carregandoHistorico} enviando={enviando} />
            )}
          </div>
          {!mostrarContexto && <ChatComposer onSend={sendMessage} />}
        </div>
      </section>
    </main>
  );
}
