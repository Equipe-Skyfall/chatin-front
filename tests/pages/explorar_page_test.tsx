// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { TrilhaExplorar } from "@/interfaces/trilha_interfaces";

const mocks = vi.hoisted(() => ({
  explorar: {} as Record<string, unknown>,
  cota: {} as Record<string, unknown>,
}));

vi.mock("@/hooks/use_explorar_trilhas", () => ({ useExplorarTrilhas: () => mocks.explorar }));
vi.mock("@/hooks/use_cota_trilhas", () => ({ useCotaTrilhas: () => mocks.cota }));
vi.mock("@/components/sidenav_components/sidenav", () => ({ Sidenav: () => null }));
vi.mock("@/components/layout_components/app_header", () => ({ AppHeader: () => null }));
vi.mock("@/components/explorar_components/trilha_detalhe_modal", () => ({
  TrilhaDetalheModal: ({ trilha }: { trilha: TrilhaExplorar | null }) =>
    trilha ? <div role="dialog">detalhe de {trilha.nome}</div> : null,
}));
vi.mock("@/components/explorar_components/criar_trilha_modal", () => ({
  CriarTrilhaModal: ({ open }: { open: boolean }) => (open ? <div role="dialog">criar trilha</div> : null),
}));

import ExplorarPage from "@/app/explorar/explorar_page";

function trilha(id: string, extra: Partial<TrilhaExplorar> = {}): TrilhaExplorar {
  return {
    id,
    nome: `Trilha ${id}`,
    descricao: null,
    verificada: id === "v",
    autor_nome: id === "v" ? null : "Ana",
    votos: 1,
    meu_voto: null,
    temas: 1,
    modulos: 3,
    alunos: 2,
    estudando: false,
    propria: false,
    pronta: true,
    created_at: "2026-10-01T00:00:00Z",
    ...extra,
  };
}

function montar(explorar: Record<string, unknown> = {}, cota: Record<string, unknown> = {}) {
  mocks.explorar = {
    origem: "todas",
    setOrigem: vi.fn(),
    ordem: "votos",
    setOrdem: vi.fn(),
    trilhas: [trilha("v"), trilha("c")],
    carregando: false,
    carregandoMais: false,
    erro: false,
    temMais: false,
    ocupadaId: null,
    carregar: vi.fn(),
    carregarMais: vi.fn(),
    estudar: vi.fn(),
    pararDeEstudar: vi.fn(),
    votar: vi.fn(),
    ...explorar,
  };
  mocks.cota = {
    cota: { limite: 3, usadas: 1, restantes: 2, reseta_em: "2026-11-01T00:00:00-03:00" },
    esgotada: false,
    recarregar: vi.fn(),
    ...cota,
  };
}

beforeEach(() => montar());

describe("ExplorarPage", () => {
  it("lista as trilhas com o badge de origem de cada uma", () => {
    render(<ExplorarPage />);

    expect(screen.getByText("Trilha v")).toBeInTheDocument();
    expect(screen.getByText("Trilha c")).toBeInTheDocument();
    expect(screen.getByText("Verificada")).toBeInTheDocument();
    expect(screen.getAllByText("Comunidade")).toHaveLength(2); // chip do filtro + badge do cartão
  });

  it("os chips alteram a origem e a ordenação", () => {
    render(<ExplorarPage />);

    fireEvent.click(screen.getByRole("button", { name: "Comunidade" }));
    fireEvent.click(screen.getByRole("button", { name: "Mais alunos" }));

    expect(mocks.explorar.setOrigem).toHaveBeenCalledWith("comunidade");
    expect(mocks.explorar.setOrdem).toHaveBeenCalledWith("alunos");
  });

  it("abrir um cartão abre o detalhe da trilha", () => {
    render(<ExplorarPage />);

    fireEvent.click(screen.getByText("Trilha c"));

    expect(screen.getByRole("dialog")).toHaveTextContent("detalhe de Trilha c");
  });

  it("Criar trilha abre o modal e mostra a cota", () => {
    render(<ExplorarPage />);

    expect(screen.getByText("1 de 3 trilhas criadas este mês")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Criar trilha" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("criar trilha");
  });

  it("com a cota esgotada o botão de criar fica desabilitado", () => {
    montar(
      {},
      { cota: { limite: 3, usadas: 3, restantes: 0, reseta_em: "2026-11-01T00:00:00-03:00" }, esgotada: true }
    );
    render(<ExplorarPage />);

    expect(screen.getByRole("button", { name: "Criar trilha" })).toBeDisabled();
  });

  it("estados de carregando, vazio e erro", () => {
    montar({ carregando: true, trilhas: [] });
    const { unmount } = render(<ExplorarPage />);
    expect(screen.getByText("Carregando trilhas...")).toBeInTheDocument();
    unmount();

    montar({ trilhas: [] });
    const vazio = render(<ExplorarPage />);
    expect(screen.getByText("Nenhuma trilha por aqui ainda")).toBeInTheDocument();
    vazio.unmount();

    montar({ erro: true, trilhas: [] });
    render(<ExplorarPage />);
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(mocks.explorar.carregar).toHaveBeenCalled();
  });

  it("carregar mais só aparece quando há mais páginas", () => {
    montar({ temMais: true });
    render(<ExplorarPage />);

    fireEvent.click(screen.getByRole("button", { name: "Carregar mais" }));

    expect(mocks.explorar.carregarMais).toHaveBeenCalled();
  });
});
