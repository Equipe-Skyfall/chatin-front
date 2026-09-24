// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { Mensagem } from "@/interfaces/chat_interfaces";

// Referências estáveis: o hook usa `tratarErro` e `user` em dependências de
// useEffect/useCallback; um objeto novo a cada render faria os efeitos rodarem
// em loop - exatamente como não acontece no app real.
const mocks = vi.hoisted(() => ({
  listarConversas: vi.fn(),
  enviarMensagem: vi.fn(),
  obterHistorico: vi.fn(),
  obterTrilha: vi.fn(),
  tratarErro: vi.fn(),
  sessao: {
    user: { id: "u1", email: "ana@chatin.com", username: "ana", role: "USER" },
    role: "USER" as "USER" | "ADMIN",
    carregando: false,
  },
}));

vi.mock("@/lib/chat", () => ({
  listarConversas: mocks.listarConversas,
  enviarMensagem: mocks.enviarMensagem,
  obterHistorico: mocks.obterHistorico,
  obterTrilha: mocks.obterTrilha,
}));
vi.mock("@/hooks/use_session", () => ({ useSession: () => mocks.sessao }));
vi.mock("@/hooks/use_study_error", () => ({ useStudyErrorHandler: () => mocks.tratarErro }));

import { useChat } from "@/hooks/use_chat";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function msg(id: string, papel: string, conteudo: string): Mensagem {
  return { id, papel, conteudo, chamadas_ferramentas: null, created_at: "2026-01-01T12:00:00Z" };
}

const trilha = {
  materias: [{ id: "m1", nome: "Matemática", temas: [] }],
};

async function montar() {
  const hook = renderHook(() => useChat());
  await waitFor(() => expect(hook.result.current.carregandoConversas).toBe(false));
  return hook;
}

beforeEach(() => {
  mocks.sessao.role = "USER";
  mocks.listarConversas.mockReset().mockResolvedValue([]);
  mocks.obterTrilha.mockReset().mockResolvedValue(trilha);
  mocks.enviarMensagem.mockReset();
  mocks.obterHistorico.mockReset();
});

describe("useChat - carregamento inicial", () => {
  it("aluno: carrega conversas e a trilha para o seletor de módulo", async () => {
    mocks.listarConversas.mockResolvedValue([{ id: "c1", titulo: "Oi", created_at: "", updated_at: "" }]);

    const { result } = await montar();

    await waitFor(() => expect(result.current.carregandoTrilha).toBe(false));
    expect(mocks.listarConversas).toHaveBeenCalledWith(false);
    expect(result.current.conversas).toHaveLength(1);
    expect(result.current.materias).toEqual(trilha.materias);
    expect(result.current.admin).toBe(false);
  });

  it("admin: usa as rotas de admin e não carrega trilha", async () => {
    mocks.sessao.role = "ADMIN";

    const { result } = await montar();

    expect(mocks.listarConversas).toHaveBeenCalledWith(true);
    expect(mocks.obterTrilha).not.toHaveBeenCalled();
    expect(result.current.carregandoTrilha).toBe(false);
    expect(result.current.admin).toBe(true);
  });

  it("erro ao listar conversas vai para o tratador de erro", async () => {
    const erro = new Error("503");
    mocks.listarConversas.mockRejectedValue(erro);

    await montar();

    expect(mocks.tratarErro).toHaveBeenCalledWith(erro);
  });
});

describe("useChat - envio de mensagens", () => {
  it("mostra a mensagem do aluno na hora (otimista) e troca pelo histórico do servidor sem duplicar", async () => {
    const envio = deferred<{ conversa_id: string; resposta: string }>();
    mocks.enviarMensagem.mockReturnValue(envio.promise);
    mocks.obterHistorico.mockResolvedValue([msg("s1", "user", "O que é PA?"), msg("s2", "assistant", "Uma sequência...")]);

    const { result } = await montar();

    act(() => result.current.sendMessage("  O que é PA?  "));

    expect(result.current.enviando).toBe(true);
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({ sender: "user", content: "O que é PA?" });

    await act(async () => envio.resolve({ conversa_id: "c1", resposta: "Uma sequência..." }));

    await waitFor(() => expect(result.current.enviando).toBe(false));
    expect(result.current.conversaId).toBe("c1");
    expect(result.current.messages.map((m) => [m.id, m.sender])).toEqual([
      ["s1", "user"],
      ["s2", "assistant"],
    ]);
    expect(mocks.obterHistorico).toHaveBeenCalledWith("c1", false, { skipCache: true });
  });

  it("ignora mensagens vazias ou só com espaços", async () => {
    const { result } = await montar();

    act(() => result.current.sendMessage("   "));

    expect(result.current.messages).toHaveLength(0);
    expect(mocks.enviarMensagem).not.toHaveBeenCalled();
  });

  it("envia o módulo escolhido ao iniciar uma conversa nova", async () => {
    mocks.enviarMensagem.mockResolvedValue({ conversa_id: "c1", resposta: "ok" });
    mocks.obterHistorico.mockResolvedValue([]);

    const { result } = await montar();

    act(() => result.current.selecionarModulo("mod-1"));
    act(() => result.current.sendMessage("Oi"));

    await waitFor(() => expect(result.current.enviando).toBe(false));
    expect(mocks.enviarMensagem).toHaveBeenCalledWith(
      { texto: "Oi", conversa_id: null, modulo_id: "mod-1" },
      false
    );
  });

  it("mensagens enviadas em sequência vão em fila, na ordem, reaproveitando a conversa criada", async () => {
    const primeiro = deferred<{ conversa_id: string; resposta: string }>();
    mocks.enviarMensagem
      .mockReturnValueOnce(primeiro.promise)
      .mockResolvedValueOnce({ conversa_id: "c1", resposta: "r2" });
    mocks.obterHistorico.mockResolvedValue([]);

    const { result } = await montar();

    act(() => {
      result.current.selecionarModulo("mod-1");
    });
    act(() => {
      result.current.sendMessage("primeira");
      result.current.sendMessage("segunda");
    });

    expect(mocks.enviarMensagem).toHaveBeenCalledTimes(1);

    await act(async () => primeiro.resolve({ conversa_id: "c1", resposta: "r1" }));
    await waitFor(() => expect(result.current.enviando).toBe(false));

    expect(mocks.enviarMensagem).toHaveBeenCalledTimes(2);
    expect(mocks.enviarMensagem.mock.calls[0][0]).toMatchObject({ texto: "primeira", conversa_id: null });
    expect(mocks.enviarMensagem.mock.calls[1][0]).toMatchObject({ texto: "segunda", conversa_id: "c1" });
  });

  it("falha no envio marca a mensagem como falhou e chama o tratador de erro", async () => {
    const erro = new Error("timeout");
    mocks.enviarMensagem.mockRejectedValue(erro);

    const { result } = await montar();

    act(() => result.current.sendMessage("Oi"));

    await waitFor(() => expect(result.current.enviando).toBe(false));
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({ content: "Oi", falhou: true });
    expect(mocks.tratarErro).toHaveBeenCalledWith(erro);
  });

  it("se o histórico falhar após o envio, mostra a resposta devolvida pelo POST", async () => {
    mocks.enviarMensagem.mockResolvedValue({ conversa_id: "c1", resposta: "Resposta da IA" });
    mocks.obterHistorico.mockRejectedValue(new Error("503"));

    const { result } = await montar();

    act(() => result.current.sendMessage("Oi"));

    await waitFor(() => expect(result.current.enviando).toBe(false));
    expect(result.current.messages.at(-1)).toMatchObject({ sender: "assistant", content: "Resposta da IA" });
  });
});

describe("useChat - navegação entre conversas", () => {
  it("abrirConversa carrega o histórico daquela conversa", async () => {
    mocks.obterHistorico.mockResolvedValue([msg("s1", "user", "Oi"), msg("s2", "assistant", "Olá!")]);

    const { result } = await montar();

    await act(() => result.current.abrirConversa("c9"));

    expect(mocks.obterHistorico).toHaveBeenCalledWith("c9", false);
    expect(result.current.conversaId).toBe("c9");
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.carregandoHistorico).toBe(false);
  });

  it("descarta mensagens sem conteúdo ou de papéis internos (ex.: tool)", async () => {
    mocks.obterHistorico.mockResolvedValue([
      msg("s1", "user", "Oi"),
      { ...msg("s2", "assistant", ""), conteudo: null },
      msg("s3", "tool", "{...}"),
      msg("s4", "assistant", "Olá!"),
    ]);

    const { result } = await montar();

    await act(() => result.current.abrirConversa("c9"));

    expect(result.current.messages.map((m) => m.id)).toEqual(["s1", "s4"]);
  });

  it("erro ao abrir conversa limpa o histórico e chama o tratador", async () => {
    const erro = new Error("404");
    mocks.obterHistorico.mockRejectedValue(erro);

    const { result } = await montar();

    await act(() => result.current.abrirConversa("c9"));

    expect(result.current.messages).toEqual([]);
    expect(mocks.tratarErro).toHaveBeenCalledWith(erro);
  });

  it("iniciarConversa zera conversa, mensagens e módulo selecionado", async () => {
    mocks.obterHistorico.mockResolvedValue([msg("s1", "user", "Oi")]);

    const { result } = await montar();

    await act(() => result.current.abrirConversa("c9"));
    act(() => result.current.selecionarModulo("mod-1"));
    act(() => result.current.iniciarConversa());

    expect(result.current.conversaId).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(result.current.moduloId).toBeNull();
  });
});
