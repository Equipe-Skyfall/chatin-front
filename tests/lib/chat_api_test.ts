import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({ studyRequest: vi.fn() }));

import { studyRequest } from "@/lib/api";
import { enviarMensagem, listarConversas, obterHistorico, obterTrilha } from "@/lib/chat";

const studyRequestMock = vi.mocked(studyRequest);

beforeEach(() => {
  studyRequestMock.mockReset();
  studyRequestMock.mockResolvedValue(undefined);
});

describe("lib/chat (chamadas da tela de chat)", () => {
  it("lista conversas do aluno em /chat e do admin em /admin/chat", async () => {
    await listarConversas();
    await listarConversas(true);

    expect(studyRequestMock).toHaveBeenNthCalledWith(1, "/chat");
    expect(studyRequestMock).toHaveBeenNthCalledWith(2, "/admin/chat");
  });

  it("envia mensagem do aluno com modulo_id e timeout longo (resposta da IA)", async () => {
    await enviarMensagem({ texto: "Oi", conversa_id: null, modulo_id: "mod-1" });

    expect(studyRequestMock).toHaveBeenCalledWith("/chat", {
      method: "POST",
      body: JSON.stringify({ texto: "Oi", conversa_id: null, modulo_id: "mod-1" }),
      timeoutMs: 300000,
    });
  });

  it("não envia modulo_id no chat do admin", async () => {
    await enviarMensagem({ texto: "Oi", conversa_id: "c1", modulo_id: "mod-1" }, true);

    const [path, opcoes] = studyRequestMock.mock.calls[0];
    expect(path).toBe("/admin/chat");
    expect(JSON.parse(opcoes?.body as string)).toEqual({ texto: "Oi", conversa_id: "c1" });
  });

  it("busca o histórico repassando skipCache", async () => {
    await obterHistorico("c1");
    await obterHistorico("c1", false, { skipCache: true });
    await obterHistorico("c2", true);

    expect(studyRequestMock).toHaveBeenNthCalledWith(1, "/chat/c1", { skipCache: undefined });
    expect(studyRequestMock).toHaveBeenNthCalledWith(2, "/chat/c1", { skipCache: true });
    expect(studyRequestMock).toHaveBeenNthCalledWith(3, "/admin/chat/c2", { skipCache: undefined });
  });

  it("busca a trilha usada no seletor de módulo", async () => {
    await obterTrilha();
    expect(studyRequestMock).toHaveBeenCalledWith("/trilha");
  });
});
