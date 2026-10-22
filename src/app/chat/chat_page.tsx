"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Menu } from "lucide-react";
import { useChat } from "@/hooks/use_chat";
import { ComecarLicaoButton } from "@/components/chat_components/comecar_licao_button";
import { ChatComposer } from "@/components/chat_components/chat_composer";
import { ChatMessages } from "@/components/chat_components/chat_messages";
import { ConversationList } from "@/components/chat_components/conversation_list";
import { ResumoEstudoButton } from "@/components/chat_components/resumo_estudo_button";
import { TrocarMateriaModal } from "@/components/chat_components/trocar_materia_modal";
import { resumoTrilhaMateria } from "@/components/quiz_components/trilha_resumo";
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
    iniciarLicaoDoModulo,
    iniciandoLicao,
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

  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const redirecionadoRef = useRef(false);
  const [conversasAberto, setConversasAberto] = useState(false);
  // Modal "Trocar matéria"; abre já na trilha vinda do Explorar/Início (`?trilha=`).
  const trilhaDoLink = searchParams.get("trilha");
  const [trocandoMateria, setTrocandoMateria] = useState(trilhaDoLink !== null);
  // Vindo do quiz sem a lição (`/chat?modulo=..&comecar=1`): chat do módulo com o
  // composer bloqueado até o aluno tocar em "Começar lição".
  const [moduloAguardandoLicao, setModuloAguardandoLicao] = useState<string | null>(null);
  const aguardandoLicao = moduloAguardandoLicao !== null && conversaId === null;

  const moduloAtualId = conversaAtual ? (conversaAtual.modulo_id ?? null) : moduloId;
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
    setModuloAguardandoLicao(null);
    abrirConversa(id);
    setConversasAberto(false);
  }

  function novaConversa() {
    iniciarConversa();
    selecionarModulo(null);
    setModuloAguardandoLicao(null);
    setConversasAberto(false);
  }

  function iniciarSessaoNoModulo(materia: string, tema: string, modulo: string) {
    selecionarMateria(materia);
    selecionarTema(tema);
    selecionarModulo(modulo);
    setTrocandoMateria(false);
    void iniciarLicaoDoModulo(modulo);
  }

  async function comecarLicao() {
    if (!moduloAguardandoLicao) return;
    const licao = await iniciarLicaoDoModulo(moduloAguardandoLicao);
    // Lição já dada e sem conversa no módulo: libera o chat normal.
    if (licao && !licao.conversa_id) setModuloAguardandoLicao(null);
  }

  function seguirSemTema() {
    selecionarModulo(null);
    setTrocandoMateria(false);
  }

  const moduloDoQuiz = searchParams.get("comecar") === "1" ? searchParams.get("modulo") : null;

  useEffect(() => {
    if (!moduloDoQuiz || admin || carregandoTrilha || redirecionadoRef.current) return;

    redirecionadoRef.current = true;

    const materia = materias.find((m) =>
      m.temas.some((tema) => tema.modulos.some((modulo) => modulo.id === moduloDoQuiz))
    );
    const tema = materia?.temas.find((t) => t.modulos.some((modulo) => modulo.id === moduloDoQuiz));

    if (materia && tema) {
      selecionarMateria(materia.id);
      selecionarTema(tema.id);
    }
    selecionarModulo(moduloDoQuiz);
    setModuloAguardandoLicao(moduloDoQuiz);
    router.replace("/chat");
  }, [
    admin,
    carregandoTrilha,
    materias,
    moduloDoQuiz,
    router,
    selecionarMateria,
    selecionarModulo,
    selecionarTema,
  ]);

  // Vindo do caminho do Início (`/chat?modulo=..&iniciar=1`): abre a lição do módulo.
  const moduloParaIniciar = searchParams.get("iniciar") === "1" ? searchParams.get("modulo") : null;

  useEffect(() => {
    if (!moduloParaIniciar || admin || carregandoTrilha || redirecionadoRef.current) return;

    redirecionadoRef.current = true;

    const materia = materias.find((m) =>
      m.temas.some((tema) => tema.modulos.some((modulo) => modulo.id === moduloParaIniciar))
    );
    const tema = materia?.temas.find((t) => t.modulos.some((modulo) => modulo.id === moduloParaIniciar));

    if (materia && tema) {
      iniciarSessaoNoModulo(materia.id, tema.id, moduloParaIniciar);
    }
    router.replace("/chat");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- iniciarSessaoNoModulo só encadeia setters estáveis e roda uma vez
  }, [admin, carregandoTrilha, materias, moduloParaIniciar, router]);

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
          acao={
            admin ? undefined : (
              <button
                type="button"
                onClick={() => setTrocandoMateria(true)}
                aria-label="Trocar matéria"
                className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-2 text-[12px] font-semibold text-charcoal shadow-neo-raised-sm transition-shadow hover:shadow-neo-raised focus-visible:ring-4 focus-visible:ring-orange/20 focus-visible:outline-none active:shadow-neo-inset-sm"
              >
                <BookOpen size={14} aria-hidden="true" />
                <span className="hidden sm:inline">Trocar matéria</span>
              </button>
            )
          }
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
        {!admin && conversaId !== null && messages.length > 0 && (
          <div className="flex items-center justify-end border-b border-line bg-white px-4 py-2">
            <ResumoEstudoButton conversaId={conversaId} />
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
            <ChatMessages
              messages={messages}
              carregando={carregandoHistorico}
              enviando={enviando || iniciandoLicao}
            />
          </div>
          {aguardandoLicao ? (
            <ComecarLicaoButton onComecar={comecarLicao} carregando={iniciandoLicao} />
          ) : (
            <ChatComposer onSend={sendMessage} />
          )}
        </div>
      </section>
      {!admin && (
        <TrocarMateriaModal
          open={trocandoMateria}
          materias={materias}
          carregando={carregandoTrilha}
          materiaInicialId={trilhaDoLink}
          onClose={() => setTrocandoMateria(false)}
          onIniciar={iniciarSessaoNoModulo}
          onSeguirSemTema={seguirSemTema}
        />
      )}
    </main>
  );
}
