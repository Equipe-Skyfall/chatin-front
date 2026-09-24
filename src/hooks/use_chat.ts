"use client";

import { useCallback, useEffect, useState } from "react";
import { enviarMensagem, listarConversas, obterHistorico, obterTrilha } from "@/lib/chat";
import { useStudyErrorHandler } from "@/hooks/use_study_error";
import { useSession } from "@/hooks/use_session";
import type { SessionUser } from "@/lib/auth";
import type {
  ChatMessage,
  Conversa,
  Mensagem,
  TrilhaMateria,
} from "@/interfaces/chat_interfaces";

function horaAtual(): string {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatarHora(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function converterMensagem(mensagem: Mensagem, user: SessionUser | null): ChatMessage | null {
  if (!mensagem.conteudo) return null;
  if (mensagem.papel !== "user" && mensagem.papel !== "assistant") return null;

  return {
    id: mensagem.id,
    sender: mensagem.papel === "user" ? "user" : "assistant",
    content: mensagem.conteudo,
    time: formatarHora(mensagem.created_at),
    user,
  };
}

function novaMensagem(
  sender: ChatMessage["sender"],
  content: string,
  user: SessionUser | null
): ChatMessage {
  return { id: crypto.randomUUID(), sender, content, time: horaAtual(), user };
}

export function useChat() {
  const { user, role, carregando: carregandoSessao } = useSession();
  const admin = role === "ADMIN";
  const tratarErro = useStudyErrorHandler();

  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [materias, setMaterias] = useState<TrilhaMateria[]>([]);
  const [moduloId, setModuloId] = useState<string | null>(null);
  const [carregandoConversas, setCarregandoConversas] = useState(true);
  const [trilhaCarregada, setTrilhaCarregada] = useState(false);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const atualizarConversas = useCallback(async () => {
    try {
      setConversas(await listarConversas(admin));
    } catch (error) {
      tratarErro(error);
    }
  }, [admin, tratarErro]);

  useEffect(() => {
    if (carregandoSessao) return;

    let ativo = true;

    listarConversas(admin)
      .then((lista) => {
        if (ativo) setConversas(lista);
      })
      .catch((error) => {
        if (ativo) tratarErro(error);
      })
      .finally(() => {
        if (ativo) setCarregandoConversas(false);
      });

    return () => {
      ativo = false;
    };
  }, [carregandoSessao, admin, tratarErro]);

  useEffect(() => {
    if (carregandoSessao || admin) return;

    let ativo = true;

    obterTrilha()
      .then((trilha) => {
        if (ativo) setMaterias(trilha.materias);
      })
      .catch((error) => {
        if (ativo) tratarErro(error);
      })
      .finally(() => {
        if (ativo) setTrilhaCarregada(true);
      });

    return () => {
      ativo = false;
    };
  }, [carregandoSessao, admin, tratarErro]);

  const carregandoTrilha = !admin && (carregandoSessao || !trilhaCarregada);

  const abrirConversa = useCallback(
    async (id: string) => {
      setConversaId(id);
      setCarregandoHistorico(true);

      try {
        const historico = await obterHistorico(id, admin);
        setMessages(
          historico
            .map((mensagem) => converterMensagem(mensagem, user))
            .filter((mensagem): mensagem is ChatMessage => mensagem !== null)
        );
      } catch (error) {
        setMessages([]);
        tratarErro(error);
      } finally {
        setCarregandoHistorico(false);
      }
    },
    [admin, tratarErro, user]
  );

  const iniciarConversa = useCallback(() => {
    setConversaId(null);
    setMessages([]);
    setModuloId(null);
  }, []);

  const selecionarModulo = useCallback((id: string | null) => {
    setModuloId(id);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const texto = content.trim();
      if (!texto || enviando) return;

      const mensagemLocal = novaMensagem("user", texto, user);
      setMessages((atuais) => [...atuais, mensagemLocal]);
      setEnviando(true);

      try {
        const resposta = await enviarMensagem(
          {
            texto,
            conversa_id: conversaId,
            modulo_id: admin || conversaId ? null : moduloId,
          },
          admin
        );

        setMessages((atuais) => [...atuais, novaMensagem("assistant", resposta.resposta, user)]);
        setConversaId(resposta.conversa_id);
        await atualizarConversas();
      } catch (error) {
        setMessages((atuais) =>
          atuais.map((mensagem) => (mensagem.id === mensagemLocal.id ? { ...mensagem, falhou: true } : mensagem))
        );
        tratarErro(error);
      } finally {
        setEnviando(false);
      }
    },
    [admin, conversaId, enviando, moduloId, atualizarConversas, tratarErro, user]
  );

  const conversaAtual = conversas.find((conversa) => conversa.id === conversaId) ?? null;

  return {
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
  };
}
