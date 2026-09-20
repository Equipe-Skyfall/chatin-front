"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/interfaces/chat_interfaces";
import { listarConversas, obterHistorico, enviarMensagem } from "@/lib/chatApi";
import { ApiError } from "@/lib/api";
import type { MensagemOut } from "@/schemas/chat";

function horaFormatada(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function paraChatMessage(mensagem: MensagemOut, index: number): ChatMessage {
  return {
    id: index,
    content: mensagem.conteudo ?? "",
    sender: mensagem.papel === "assistant" ? "assistant" : "user",
    time: horaFormatada(mensagem.created_at),
  };
}

export function useChat(moduloId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const conversaIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    conversaIdRef.current = null;
    setMessages([]);
    setCarregando(true);
    setErro(null);

    listarConversas()
      .then(async (conversas) => {
        const existente = conversas
          .filter((c) => c.modulo_id === moduloId)
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
        if (!existente) return;
        const historico = await obterHistorico(existente.id);
        if (cancelado) return;
        conversaIdRef.current = existente.id;
        setMessages(historico.map(paraChatMessage));
      })
      .catch((e) => {
        if (!cancelado) setErro(e instanceof ApiError ? e.message : "Falha ao carregar conversa");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [moduloId]);

  async function sendMessage(content: string) {
    const texto = content.trim();
    if (!texto || enviando) return;

    const minhaMensagem: ChatMessage = {
      id: Date.now(),
      sender: "user",
      content: texto,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((atuais) => [...atuais, minhaMensagem]);
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await enviarMensagem(texto, {
        conversaId: conversaIdRef.current ?? undefined,
        moduloId: conversaIdRef.current ? undefined : moduloId,
      });
      conversaIdRef.current = resposta.conversa_id;
      setMessages((atuais) => [
        ...atuais,
        {
          id: Date.now() + 1,
          sender: "assistant",
          content: resposta.resposta,
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao enviar mensagem");
    } finally {
      setEnviando(false);
    }
  }

  return { messages, sendMessage, carregando, enviando, erro };
}
