// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  chat: {} as Record<string, unknown>,
  replace: vi.fn(),
  push: vi.fn(),
  params: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
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
vi.mock("@/components/chat_components/trocar_materia_modal", () => ({
  TrocarMateriaModal: ({
    open,
    materiaInicialId,
    onIniciar,
  }: {
    open: boolean;
    materiaInicialId?: string | null;
    onIniciar: (materia: string, tema: string, modulo: string) => void;
  }) =>
    open ? (
      <div role="dialog">
        seletor de conteúdo {materiaInicialId ?? "-"}
        <button type="button" onClick={() => onIniciar("mat1", "t1", "mod1")}>
          abrir módulo
        </button>
      </div>
    ) : null,
}));
vi.mock("@/components/chat_components/chat_composer", () => ({
  ChatComposer: () => <div>composer</div>,
}));
vi.mock("@/components/chat_components/chat_messages", () => ({
  ChatMessages: ({ messages }: { messages: unknown[] }) => <div>{messages.length} mensagens</div>,
}));
vi.mock("@/components/layout_components/app_header", () => ({
  AppHeader: ({ acao }: { acao?: React.ReactNode }) => <div>{acao}</div>,
}));

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
  mocks.push.mockReset();
  montarChat();
});

describe("ChatPage - ▶ do seletor de conteúdo", () => {
  it("ancora o chat no módulo escolhido, numa conversa nova, sem abrir a apostila", () => {
    render(<ChatPage />);

    fireEvent.click(screen.getByRole("button", { name: "Trocar conteúdo" }));
    fireEvent.click(screen.getByRole("button", { name: "abrir módulo" }));

    expect(mocks.chat.iniciarConversa as ReturnType<typeof vi.fn>).toHaveBeenCalled();
    expect(mocks.chat.selecionarMateria as ReturnType<typeof vi.fn>).toHaveBeenCalledWith("mat1");
    expect(mocks.chat.selecionarModulo as ReturnType<typeof vi.fn>).toHaveBeenCalledWith("mod1");
    expect(mocks.push).not.toHaveBeenCalled();
  });
});

describe("ChatPage - gerar resumo", () => {
  it("mostra o botão assim que a conversa existe, mesmo antes da lista de conversas atualizar", () => {
    montarChat({ conversaId: "c1", conversaAtual: null, messages: [{ id: "m" }] });

    render(<ChatPage />);

    expect(screen.getByRole("button", { name: /Gerar resumo de estudo c1/ })).toBeTruthy();
  });

  it("não mostra o botão numa conversa vazia", () => {
    render(<ChatPage />);

    expect(screen.queryByRole("button", { name: /Gerar resumo/ })).toBeNull();
  });
});

describe("ChatPage - só a conversa e o botão Trocar conteúdo", () => {
  it("abre direto no chat, com composer, sem tela de contexto", () => {
    render(<ChatPage />);

    expect(screen.getByText("composer")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Trocar conteúdo abre o seletor", () => {
    render(<ChatPage />);

    fireEvent.click(screen.getByRole("button", { name: "Trocar conteúdo" }));

    expect(screen.getByRole("dialog").textContent).toContain("seletor de conteúdo");
  });

  it("admin não tem o botão", () => {
    montarChat({ admin: true });
    render(<ChatPage />);

    expect(screen.queryByRole("button", { name: "Trocar conteúdo" })).toBeNull();
  });

  it("vindo do Explorar (?trilha=) o modal abre já na trilha", () => {
    mocks.params = new URLSearchParams("trilha=mat1");

    render(<ChatPage />);

    expect(screen.getByRole("dialog").textContent).toContain("mat1");
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

  it("lição que falha (IA fora do ar) não trava o chat: libera o composer", async () => {
    mocks.params = new URLSearchParams("modulo=mod1&comecar=1");
    montarChat({ iniciarLicaoDoModulo: vi.fn().mockResolvedValue(null) });

    render(<ChatPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Começar lição" }));

    await waitFor(() => expect(screen.getByText("composer")).toBeTruthy());
    expect(screen.queryByRole("button", { name: "Começar lição" })).toBeNull();
  });

  it("sem o parâmetro comecar o chat abre normal", () => {
    mocks.params = new URLSearchParams("modulo=mod1");

    render(<ChatPage />);

    expect(screen.getByText("composer")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Começar lição" })).toBeNull();
  });
});
