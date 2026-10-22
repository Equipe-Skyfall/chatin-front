"use client";

import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { gerarModulosAutomaticamente, obterStatusTema } from "@/lib/materias";

/**
 * Geração de apostila em segundo plano.
 *
 * A matéria e o tema são criados na hora; os módulos são gerados pelo back em
 * background. Este store acompanha esse trabalho *fora* do React, então o aluno
 * pode navegar (ou fechar o dialog) sem interromper nada. Quando fica pronto, um
 * toast global avisa e oferece abrir a apostila.
 */

export interface GeracaoApostila {
  materiaId: string;
  materiaNome: string;
  temaId: string;
  iniciadoEm: string;
}

const CHAVE_STORAGE = "chatin:geracao-apostila";
const POLL_INTERVAL_MS = 3000;
const MAX_TENTATIVAS = 60;

let geracoes: GeracaoApostila[] = [];
const ouvintes = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const tentativas = new Map<string, number>();
const geracaoSolicitada = new Set<string>();
let retomado = false;

const VAZIO: GeracaoApostila[] = [];

function emitir(): void {
  ouvintes.forEach((ouvinte) => ouvinte());
}

function inscrever(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function ler(): GeracaoApostila[] {
  return geracoes;
}

function lerNoServidor(): GeracaoApostila[] {
  return VAZIO;
}

function idToast(materiaId: string): string {
  return `geracao-${materiaId}`;
}

function abrirApostila(materiaId: string): void {
  if (typeof window === "undefined") return;
  // Store global, fora do React: não há `useRouter` aqui. A navegação completa
  // é intencional (ação do toast, pode disparar de qualquer tela).
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/apostilas/${materiaId}`);
}

function persistir(): void {
  if (typeof window === "undefined") return;

  try {
    if (geracoes.length === 0) window.localStorage.removeItem(CHAVE_STORAGE);
    else window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(geracoes));
  } catch {
    // Sem storage (modo privado): a geração segue, só não é retomada após reload.
  }
}

function acompanhar(materiaId: string, temaId: string): void {
  const tentativa = (tentativas.get(materiaId) ?? 0) + 1;
  tentativas.set(materiaId, tentativa);

  void (async () => {
    try {
      const status = await obterStatusTema(temaId);

      if (!geracoes.some((geracao) => geracao.materiaId === materiaId)) return;

      if (status.pronto_para_estudar) {
        concluir(materiaId);
        return;
      }

      const statusTema = status.tema_status.toLowerCase();

      if (statusTema === "erro") {
        falhar(materiaId, "Não foi possível montar esse tópico.");
        return;
      }

      // O tema nasce 'gerando' (reunindo fontes) e só depois fica 'pronto'.
      // Pedir módulos antes disso não gera nada.
      if (!geracaoSolicitada.has(materiaId) && statusTema === "pronto") {
        await gerarModulosAutomaticamente(temaId);
        geracaoSolicitada.add(materiaId);
      }

      const semProgresso =
        status.modulos_com_erro > 0 && status.modulos_gerando === 0 && status.modulos_prontos === 0;

      if (semProgresso) {
        falhar(materiaId, "Não foi possível gerar o conteúdo dessa apostila.");
        return;
      }

      if (tentativa >= MAX_TENTATIVAS) {
        desistir(materiaId);
        return;
      }

      agendar(materiaId, temaId);
    } catch {
      // Falha transitória: tenta de novo até o limite.
      if (tentativa >= MAX_TENTATIVAS) desistir(materiaId);
      else agendar(materiaId, temaId);
    }
  })();
}

function agendar(materiaId: string, temaId: string): void {
  timers.set(
    materiaId,
    setTimeout(() => acompanhar(materiaId, temaId), POLL_INTERVAL_MS)
  );
}

function esquecer(materiaId: string): GeracaoApostila | undefined {
  const geracao = geracoes.find((item) => item.materiaId === materiaId);

  const timer = timers.get(materiaId);
  if (timer) clearTimeout(timer);
  timers.delete(materiaId);
  tentativas.delete(materiaId);
  geracaoSolicitada.delete(materiaId);

  geracoes = geracoes.filter((item) => item.materiaId !== materiaId);
  emitir();
  persistir();

  return geracao;
}

function concluir(materiaId: string): void {
  const geracao = esquecer(materiaId);

  toast.success(`Sua apostila${geracao ? ` "${geracao.materiaNome}"` : ""} está pronta!`, {
    id: idToast(materiaId),
    description: "O conteúdo já está disponível para estudar.",
    action: { label: "Abrir", onClick: () => abrirApostila(materiaId) },
  });
}

function falhar(materiaId: string, motivo: string): void {
  const geracao = esquecer(materiaId);

  toast.error(`Não foi possível gerar${geracao ? ` "${geracao.materiaNome}"` : " a apostila"}.`, {
    id: idToast(materiaId),
    description: motivo,
    action: { label: "Abrir", onClick: () => abrirApostila(materiaId) },
  });
}

function desistir(materiaId: string): void {
  const geracao = esquecer(materiaId);

  toast.info(`A geração${geracao ? ` de "${geracao.materiaNome}"` : " da apostila"} está demorando mais que o esperado.`, {
    id: idToast(materiaId),
    description: "Você pode abrir a apostila para acompanhar.",
    action: { label: "Abrir", onClick: () => abrirApostila(materiaId) },
  });
}

/** Começa a acompanhar a geração dos módulos de uma apostila recém-criada. */
export function iniciarGeracaoApostila(dados: { materiaId: string; materiaNome: string; temaId: string }): void {
  if (geracoes.some((geracao) => geracao.materiaId === dados.materiaId)) return;

  geracoes = [...geracoes, { ...dados, iniciadoEm: new Date().toISOString() }];
  emitir();
  persistir();

  toast.loading("Gerando o conteúdo da sua apostila...", {
    id: idToast(dados.materiaId),
    description: "Você pode continuar navegando enquanto isso.",
  });

  acompanhar(dados.materiaId, dados.temaId);
}

/** Retoma as gerações pendentes salvas (ex.: após um reload), uma vez. */
function retomarPendentes(): void {
  if (retomado || typeof window === "undefined") return;
  retomado = true;

  let salvos: GeracaoApostila[] = [];
  try {
    const bruto = window.localStorage.getItem(CHAVE_STORAGE);
    const dados: unknown = bruto ? JSON.parse(bruto) : [];
    salvos = Array.isArray(dados) ? (dados as GeracaoApostila[]) : [];
  } catch {
    salvos = [];
  }

  for (const geracao of salvos) {
    if (!geracao?.materiaId || !geracao?.temaId) continue;
    if (geracoes.some((item) => item.materiaId === geracao.materiaId)) continue;

    geracoes = [...geracoes, geracao];
    acompanhar(geracao.materiaId, geracao.temaId);
  }

  if (salvos.length > 0) emitir();
}

export function useGeracaoApostila() {
  const atuais = useSyncExternalStore(inscrever, ler, lerNoServidor);

  useEffect(() => {
    retomarPendentes();
  }, []);

  return { geracoes: atuais };
}

/** Zera o store (logout/testes). */
export function limparGeracoes(): void {
  timers.forEach((timer) => clearTimeout(timer));
  timers.clear();
  tentativas.clear();
  geracaoSolicitada.clear();
  geracoes = [];
  retomado = false;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CHAVE_STORAGE);
    } catch {
      // sem storage, nada a limpar
    }
  }

  emitir();
}
