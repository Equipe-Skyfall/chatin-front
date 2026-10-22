"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { enviarMensagem } from "@/lib/chat";
import { useSession } from "@/hooks/use_session";
import { useStudyErrorHandler } from "@/hooks/use_study_error";
import { ChatComposer } from "./chat_composer";
import { ChatMessages } from "./chat_messages";
import type { ChatMessage } from "@/interfaces/chat_interfaces";

interface ChatinFlutuanteProps {
  /** Módulo que o aluno está lendo; ancora a conversa ao tema. */
  moduloId?: string | null;
  /** Título mostrado no cabeçalho do balão. */
  titulo?: string | null;
}

function horaAtual(): string {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Balão flutuante no canto inferior direito para conversar com o CHATin sobre
 * o conteúdo que está sendo lido. */
export function ChatinFlutuante({ moduloId = null, titulo = null }: ChatinFlutuanteProps) {
  const { user } = useSession();
  const tratarErro = useStudyErrorHandler();

  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<ChatMessage[]>([]);
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [mensagens, enviando, aberto]);

  async function enviar(texto: string) {
    const limpo = texto.trim();
    if (!limpo || enviando) return;

    const mensagem: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      content: limpo,
      time: horaAtual(),
      user,
    };
    setMensagens((atual) => [...atual, mensagem]);
    setEnviando(true);

    try {
      const resposta = await enviarMensagem({
        texto: limpo,
        conversa_id: conversaId,
        // Só ancora a conversa ao módulo na primeira mensagem: depois o backend
        // já guarda o contexto da conversa.
        modulo_id: conversaId ? null : moduloId,
      });
      setConversaId(resposta.conversa_id);

      const conteudo = resposta.resposta?.trim();
      if (conteudo) {
        setMensagens((atual) => [
          ...atual,
          {
            id: crypto.randomUUID(),
            sender: "assistant",
            content: conteudo,
            time: horaAtual(),
            user: null,
            fontes: resposta.fontes,
          },
        ]);
      }
    } catch (error) {
      setMensagens((atual) =>
        atual.map((item) => (item.id === mensagem.id ? { ...item, falhou: true } : item))
      );
      tratarErro(error, { ia: true });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {aberto && (
          <motion.section
            key="painel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-label="Chat com o CHATin"
            className="fixed right-4 bottom-24 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-[16px] bg-white shadow-neo-raised"
          >
            <header className="flex items-center gap-3 bg-orange px-4 py-3 text-white">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95">
                <Image
                  src="/CHATin-LOGO.png"
                  alt="CHATin"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[14px] font-semibold leading-tight">CHATin</p>
                <p className="truncate text-[11.5px] text-white/85">
                  {titulo ?? "Tire suas dúvidas sobre o conteúdo"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar chat"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15"
              >
                <X size={18} />
              </button>
            </header>

            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-surface">
              <ChatMessages messages={mensagens} enviando={enviando} />
            </div>

            <ChatComposer onSend={enviar} disabled={enviando} />
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        aria-label={aberto ? "Fechar chat do CHATin" : "Falar com o CHATin"}
        aria-expanded={aberto}
        className="fixed right-4 bottom-4 z-50 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-orange shadow-neo-raised transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-orange/30 focus-visible:outline-none active:scale-95"
      >
        <Image
          src="/CHATin-LOGO.png"
          alt="CHATin"
          width={52}
          height={52}
          className="h-[52px] w-[52px] scale-110 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
        />
      </button>
    </>
  );
}
