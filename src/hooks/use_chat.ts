"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const INTERVALO_ACOMPANHAMENTO_MS = 30000;

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

interface ItemFila {
  id: string;
  texto: string;
  moduloId: string | null;
}

function removerRefletidas(pendentes: ChatMessage[], historico: ChatMessage[]): ChatMessage[] {
  const restantes = historico.filter((mensagem) => mensagem.sender === "user").map((mensagem) => mensagem.content);

  return pendentes.filter((pendente) => {
    if (pendente.falhou) return true;

    const indice = restantes.indexOf(pendente.content);
    if (indice === -1) return true;

    restantes.splice(indice, 1);
    return false;
  });
}

export function useChat() {
  const { user, role, carregando: carregandoSessao } = useSession();
  const admin = role === "ADMIN";
  const tratarErro = useStudyErrorHandler();

  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [historico, setHistorico] = useState<ChatMessage[]>([]);
  const [pendentes, setPendentes] = useState<ChatMessage[]>([]);
  const [materias, setMaterias] = useState<TrilhaMateria[]>([]);
  const [materiaId, setMateriaId] = useState<string | null>(null);
  const [temaId, setTemaId] = useState<string | null>(null);
  const [moduloId, setModuloId] = useState<string | null>(null);
  const [carregandoConversas, setCarregandoConversas] = useState(true);
  const [trilhaCarregada, setTrilhaCarregada] = useState(false);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const conversaIdRef = useRef<string | null>(null);
  const conversasRef = useRef<Conversa[]>([]);
  const idsConhecidosRef = useRef<Set<string>>(new Set());
  const tituloEnvioRef = useRef<string | null>(null);
  const filaRef = useRef<ItemFila[]>([]);
  const processandoRef = useRef(false);

  const definirConversaId = useCallback((id: string | null) => {
    conversaIdRef.current = id;
    setConversaId(id);
  }, []);

  const aplicarConversas = useCallback((lista: Conversa[]) => {
    conversasRef.current = lista;
    setConversas(lista);
  }, []);

  const aplicarHistorico = useCallback(
    (lista: Mensagem[]) => {
      const convertidas = lista
        .map((mensagem) => converterMensagem(mensagem, user))
        .filter((mensagem): mensagem is ChatMessage => mensagem !== null);

      setHistorico(convertidas);
      setPendentes((atuais) => removerRefletidas(atuais, convertidas));
    },
    [user]
  );

  const atualizarConversas = useCallback(async () => {
    try {
      aplicarConversas(await listarConversas(admin));
    } catch (error) {
      tratarErro(error);
    }
  }, [admin, aplicarConversas, tratarErro]);

  const atualizarHistorico = useCallback(async () => {
    const id = conversaIdRef.current;
    if (!id) return;

    try {
      aplicarHistorico(await obterHistorico(id, admin, { skipCache: true }));
    } catch {
      // Acompanhamento em segundo plano: uma falha aqui não interrompe a conversa.
    }
  }, [admin, aplicarHistorico]);

  const descobrirConversa = useCallback(async () => {
    if (conversaIdRef.current !== null) return;

    const titulo = tituloEnvioRef.current;
    if (!titulo) return;

    try {
      const lista = await listarConversas(admin);
      aplicarConversas(lista);

      const encontrada = lista.find(
        (conversa) => conversa.titulo === titulo && !idsConhecidosRef.current.has(conversa.id)
      );

      if (encontrada) {
        definirConversaId(encontrada.id);
        await atualizarHistorico();
      }
    } catch {
      // Acompanhamento em segundo plano: uma falha aqui não interrompe a conversa.
    }
  }, [admin, aplicarConversas, atualizarHistorico, definirConversaId]);

  useEffect(() => {
    if (carregandoSessao) return;

    let ativo = true;

    listarConversas(admin)
      .then((lista) => {
        if (ativo) aplicarConversas(lista);
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
  }, [carregandoSessao, admin, aplicarConversas, tratarErro]);

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

  useEffect(() => {
    if (!enviando) return;

    let ativo = true;

    const intervalo = setInterval(() => {
      if (!ativo) return;

      if (conversaIdRef.current) void atualizarHistorico();
      else void descobrirConversa();
    }, INTERVALO_ACOMPANHAMENTO_MS);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [enviando, atualizarHistorico, descobrirConversa]);

  const carregandoTrilha = !admin && (carregandoSessao || !trilhaCarregada);

  const abrirConversa = useCallback(
    async (id: string) => {
      definirConversaId(id);
      setPendentes([]);
      setCarregandoHistorico(true);

      try {
        aplicarHistorico(await obterHistorico(id, admin));
      } catch (error) {
        setHistorico([]);
        tratarErro(error);
      } finally {
        setCarregandoHistorico(false);
      }
    },
    [admin, aplicarHistorico, definirConversaId, tratarErro]
  );

  const iniciarConversa = useCallback(() => {
    definirConversaId(null);
    setHistorico([]);
    setPendentes([]);
    setMateriaId(null);
    setTemaId(null);
    setModuloId(null);
  }, [definirConversaId]);

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

  const marcarFalha = useCallback((id: string) => {
    setPendentes((atuais) =>
      atuais.map((mensagem) => (mensagem.id === id ? { ...mensagem, falhou: true } : mensagem))
    );
  }, []);

  const processarFila = useCallback(async () => {
    if (processandoRef.current) return;

    processandoRef.current = true;
    setEnviando(true);

    try {
      while (filaRef.current.length > 0) {
        const item = filaRef.current[0];

        if (conversaIdRef.current === null) {
          idsConhecidosRef.current = new Set(conversasRef.current.map((conversa) => conversa.id));
          tituloEnvioRef.current = item.texto.slice(0, 200);
        }

        try {
          const resposta = await enviarMensagem(
            {
              texto: item.texto,
              conversa_id: conversaIdRef.current,
              modulo_id: item.moduloId,
            },
            admin
          );

          definirConversaId(resposta.conversa_id);

          try {
            aplicarHistorico(await obterHistorico(resposta.conversa_id, admin, { skipCache: true }));
          } catch {
            setPendentes((atuais) => atuais.filter((mensagem) => mensagem.id !== item.id));

            const texto = resposta.resposta?.trim();
            if (texto) {
              setHistorico((atuais) => [...atuais, novaMensagem("assistant", texto, user)]);
            }
          }

          await atualizarConversas();
        } catch (error) {
          marcarFalha(item.id);
          tratarErro(error);
        } finally {
          filaRef.current = filaRef.current.slice(1);
        }
      }
    } finally {
      tituloEnvioRef.current = null;
      processandoRef.current = false;
      setEnviando(false);
    }
  }, [admin, aplicarHistorico, atualizarConversas, definirConversaId, marcarFalha, tratarErro, user]);

  const sendMessage = useCallback(
    (content: string) => {
      const texto = content.trim();
      if (!texto) return;

      const mensagem = novaMensagem("user", texto, user);
      setPendentes((atuais) => [...atuais, mensagem]);

      filaRef.current = [
        ...filaRef.current,
        {
          id: mensagem.id,
          texto,
          moduloId: admin || conversaIdRef.current ? null : moduloId,
        },
      ];

      void processarFila();
    },
    [admin, moduloId, processarFila, user]
  );

  const messages = useMemo(() => [...historico, ...pendentes], [historico, pendentes]);
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
