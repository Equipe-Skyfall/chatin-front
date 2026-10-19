// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  chat: {} as Record<string, unknown>,
  replace: vi.fn(),
  params: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
  useSearchParams: () => mocks.params,
}));
vi.mock("@/hooks/use_chat", () => ({ useChat: () => mocks.chat }));
vi.mock("@/components/sidenav_components/sidenav", () => ({ Sidenav: () => null }));
vi.mock("@/components/chat_components/conversation_list", () => ({ ConversationList: () => null }));
vi.mock("@/components/chat_components/resumo_estudo_button", () => ({
  ResumoEstudoButton: ({ conversaId }: { conversaId: string }) => (
    <button type="button">Gerar resumo de estudo {conversaId}</button>
  ),
}));
vi.mock("@/components/chat_components/trilha_seletor", () => ({
  TrilhaSeletor: () => <div>tela de contexto</div>,
}));
vi.mock("@/components/chat_components/chat_composer", () => ({
  ChatComposer: () => <div>composer</div>,
}));
vi.mock("@/components/chat_components/chat_messages", () => ({
  ChatMessages: ({ messages }: { messages: unknown[] }) => <div>{messages.length} mensagens</div>,
}));
vi.mock("@/components/layout_components/app_header", () => ({ AppHeader: () => null }));

import ChatPage from "@/app/chat/chat_page";

const materias = [
  {
    id: "mat1",
    nome: "História",
    temas: [
      {
        id: "t1",
        titulo: "Revolução",
        ordem: 1,
        estado: "disponivel",
        modulos: [{ id: "mod1", titulo: "Causas", ordem: 1, estado: "disponivel" }],
      },
    ],
  },
];

function montarChat(extra: Record<string, unknown> = {}) {
  mocks.chat = {
    admin: false,
    messages: [],
    sendMessage: vi.fn(),
    conversas: [],
    conversaId: null,
    conversaAtual: null,
    abrirConversa: vi.fn(),
    iniciarConversa: vi.fn(),
    iniciarLicaoDoModulo: vi.fn().mockResolvedValue({ conversa_id: "c1", start_lesson: true }),
    iniciandoLicao: false,
    materias,
    moduloId: null,
    selecionarMateria: vi.fn(),
    selecionarTema: vi.fn(),
    selecionarModulo: vi.fn(),
    carregandoConversas: false,
    carregandoTrilha: false,
    carregandoHistorico: false,
    enviando: false,
    ...extra,
  };
}

beforeEach(() => {
  mocks.params = new URLSearchParams();
  mocks.replace.mockReset();
  montarChat();
});

describe("ChatPage - gerar resumo", () => {
  it("mostra o botão assim que a conversa existe, mesmo antes da lista de conversas atualizar", () => {
    montarChat({ conversaId: "c1", conversaAtual: null, messages: [{ id: "m" }] });

    render(<ChatPage />);

    expect(screen.getByRole("button", { name: /Gerar resumo de estudo c1/ })).toBeTruthy();
  });

  it("não mostra o botão na tela de contexto", () => {
    render(<ChatPage />);

    expect(screen.getByText("tela de contexto")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Gerar resumo/ })).toBeNull();
  });
});

describe("ChatPage - vindo do quiz sem a lição", () => {
  it("abre o chat do módulo com o composer bloqueado e o pill Começar lição", async () => {
    mocks.params = new URLSearchParams("modulo=mod1&comecar=1");

    render(<ChatPage />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Começar lição" })).toBeTruthy());
    expect((mocks.chat.selecionarMateria as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("mat1");
    expect((mocks.chat.selecionarTema as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("t1");
    expect((mocks.chat.selecionarModulo as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("mod1");
    expect(mocks.replace).toHaveBeenCalledWith("/chat");
    expect(screen.queryByText("composer")).toBeNull();
    expect(screen.queryByText("tela de contexto")).toBeNull();
  });

  it("Começar lição dispara a lição do módulo", async () => {
    mocks.params = new URLSearchParams("modulo=mod1&comecar=1");

    render(<ChatPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Começar lição" }));

    await waitFor(() =>
      expect(mocks.chat.iniciarLicaoDoModulo as ReturnType<typeof vi.fn>).toHaveBeenCalledWith("mod1")
    );
  });

  it("lição já dada e sem conversa: libera o composer do chat", async () => {
    mocks.params = new URLSearchParams("modulo=mod1&comecar=1");
    montarChat({
      iniciarLicaoDoModulo: vi
        .fn()
        .mockResolvedValue({ conversa_id: null, resposta: null, ja_enviada: true, start_lesson: true }),
    });

    render(<ChatPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Começar lição" }));

    await waitFor(() => expect(screen.getByText("composer")).toBeTruthy());
    expect(screen.queryByRole("button", { name: "Começar lição" })).toBeNull();
  });

  it("sem o parâmetro comecar a tela de contexto continua igual", () => {
    mocks.params = new URLSearchParams("modulo=mod1");

    render(<ChatPage />);

    expect(screen.getByText("tela de contexto")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Começar lição" })).toBeNull();
  });
});
