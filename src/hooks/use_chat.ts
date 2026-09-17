"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { logout, getCurrentUser } from "@/lib/auth";
import { enviarMensagem, listarConversas, obterHistorico, obterTrilha } from "@/lib/chat";
import { getStudyErrorMessage } from "@/lib/errorMessages";
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

function converterMensagem(mensagem: Mensagem): ChatMessage | null {
  if (!mensagem.conteudo) return null;
  if (mensagem.papel !== "user" && mensagem.papel !== "assistant") return null;

  return {
    id: mensagem.id,
    sender: mensagem.papel === "user" ? "user" : "assistant",
    content: mensagem.conteudo,
    time: formatarHora(mensagem.created_at),
    user: getCurrentUser(),
  };
}

function novaMensagem(sender: ChatMessage["sender"], content: string): ChatMessage {
  return { id: crypto.randomUUID(), sender, content, time: horaAtual(), user: getCurrentUser() };
}

export function useChat() {
  const router = useRouter();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [materias, setMaterias] = useState<TrilhaMateria[]>([]);
  const [materiaId, setMateriaId] = useState<string | null>(null);
  const [temaId, setTemaId] = useState<string | null>(null);
  const [moduloId, setModuloId] = useState<string | null>(null);
  const [carregandoConversas, setCarregandoConversas] = useState(true);
  const [carregandoTrilha, setCarregandoTrilha] = useState(true);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const tratarErro = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        toast.error("Sua sessão expirou. Faça login novamente.");
        router.push("/");
        return;
      }
      toast.error(getStudyErrorMessage(error));
    },
    [router]
  );

  const atualizarConversas = useCallback(async () => {
    try {
      setConversas(await listarConversas());
    } catch (error) {
      tratarErro(error);
    }
  }, [tratarErro]);

  useEffect(() => {
    let ativo = true;

    listarConversas()
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
  }, [tratarErro]);

  useEffect(() => {
    let ativo = true;

    obterTrilha()
      .then((trilha) => {
        if (ativo) setMaterias(trilha.materias);
      })
      .catch((error) => {
        if (ativo) tratarErro(error);
      })
      .finally(() => {
        if (ativo) setCarregandoTrilha(false);
      });

    return () => {
      ativo = false;
    };
  }, [tratarErro]);

  const abrirConversa = useCallback(
    async (id: string) => {
      setConversaId(id);
      setCarregandoHistorico(true);

      try {
        const historico = await obterHistorico(id);
        setMessages(historico.map(converterMensagem).filter((mensagem): mensagem is ChatMessage => mensagem !== null));
      } catch (error) {
        setMessages([]);
        tratarErro(error);
      } finally {
        setCarregandoHistorico(false);
      }
    },
    [tratarErro]
  );

  const iniciarConversa = useCallback(() => {
    setConversaId(null);
    setMessages([]);
    setMateriaId(null);
    setTemaId(null);
    setModuloId(null);
  }, []);

  const selecionarMateria = useCallback((id: string) => {
    setMateriaId(id);
    setTemaId(null);
    setModuloId(null);
  }, []);

  const selecionarTema = useCallback((id: string) => {
    setTemaId(id);
    setModuloId(null);
  }, []);

  const selecionarModulo = useCallback((id: string | null) => {
    setModuloId(id);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const texto = content.trim();
      if (!texto || enviando) return;

      const mensagemLocal = novaMensagem("user", texto);
      setMessages((atuais) => [...atuais, mensagemLocal]);
      setEnviando(true);

      try {
        const resposta = await enviarMensagem({
          texto,
          conversa_id: conversaId,
          modulo_id: conversaId ? null : moduloId,
        });

        setMessages((atuais) => [...atuais, novaMensagem("assistant", resposta.resposta)]);
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
    [conversaId, enviando, moduloId, atualizarConversas, tratarErro]
  );

  const conversaAtual = conversas.find((conversa) => conversa.id === conversaId) ?? null;

  return {
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
  };
}
