// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Materia } from "@/lib/materias";

const mocks = vi.hoisted(() => ({
  useMateriaLeitura: vi.fn(),
  useProgressoLeitura: vi.fn(),
}));

vi.mock("@/hooks/use_materia_leitura", () => ({ useMateriaLeitura: mocks.useMateriaLeitura }));
vi.mock("@/hooks/use_progresso_leitura", () => ({ useProgressoLeitura: mocks.useProgressoLeitura }));
vi.mock("@/components/sidenav_components/sidenav", () => ({ Sidenav: () => null }));
vi.mock("@/components/layout_components/app_header", () => ({
  AppHeader: ({ title }: { title: string }) => <div data-testid="app-header">{title}</div>,
}));
vi.mock("@/components/chat_components/chatin_flutuante", () => ({ ChatinFlutuante: () => null }));
vi.mock("@/components/materias_components/materia_reader", () => ({
  MateriaReader: ({ materia, modulosLidos }: { materia: Materia; modulosLidos?: string[] }) => (
    <div data-testid="reader" data-lidos={(modulosLidos ?? []).join(",")}>
      {materia.nome}
    </div>
  ),
}));

import MateriaLeituraPage from "@/app/apostilas/[materiaId]/materia_leitura_page";

const materia: Materia = {
  id: "mat1",
  nome: "História",
  descricao: "Revoluções",
  owner_user_id: "u1",
  votos: 3,
  created_at: "2026-01-01T00:00:00Z",
};

function estadoDoHook(overrides: Record<string, unknown> = {}) {
  return {
    materia,
    temas: [],
    estadosModulos: {},
    estadosTemas: {},
    carregando: false,
    erro: false,
    moduloSelecionadoId: "m2",
    selecionarModulo: vi.fn(),
    moduloDetalhe: null,
    carregandoModulo: false,
    moduloBloqueado: false,
    erroModulo: false,
    recarregarModulo: vi.fn(),
    modulosLidos: [] as string[],
    marcarModuloLido: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mocks.useMateriaLeitura.mockReset().mockReturnValue(estadoDoHook());
  mocks.useProgressoLeitura.mockReset().mockReturnValue(42);
});

describe("MateriaLeituraPage - orquestração da tela de estudo", () => {
  it("repassa a matéria e o módulo pedido para o hook", () => {
    render(<MateriaLeituraPage materiaId="mat1" moduloInicialId="m2" />);

    expect(mocks.useMateriaLeitura).toHaveBeenCalledWith("mat1", "m2");
  });

  it("mostra o carregamento enquanto a apostila não chega", () => {
    mocks.useMateriaLeitura.mockReturnValue(estadoDoHook({ materia: null, carregando: true }));

    render(<MateriaLeituraPage materiaId="mat1" />);

    expect(screen.getByText("Carregando apostila...")).toBeTruthy();
  });

  it("mostra erro quando a apostila não carrega", () => {
    mocks.useMateriaLeitura.mockReturnValue(estadoDoHook({ materia: null, erro: true }));

    render(<MateriaLeituraPage materiaId="mat1" />);

    expect(screen.getByText("Não foi possível carregar essa apostila.")).toBeTruthy();
  });

  it("renderiza o leitor com a matéria carregada", () => {
    render(<MateriaLeituraPage materiaId="mat1" />);

    expect(screen.getByTestId("reader").textContent).toBe("História");
  });

  it("repassa o progresso de leitura ao leitor", () => {
    mocks.useMateriaLeitura.mockReturnValue(estadoDoHook({ modulosLidos: ["m1", "m2"] }));

    render(<MateriaLeituraPage materiaId="mat1" />);

    expect(screen.getByTestId("reader").getAttribute("data-lidos")).toBe("m1,m2");
  });

  it("usa o nome da matéria no cabeçalho, com fallback para Apostila", () => {
    const { unmount } = render(<MateriaLeituraPage materiaId="mat1" />);
    expect(screen.getByTestId("app-header").textContent).toBe("História");
    unmount();

    mocks.useMateriaLeitura.mockReturnValue(estadoDoHook({ materia: null, carregando: true }));
    render(<MateriaLeituraPage materiaId="mat1" />);
    expect(screen.getByTestId("app-header").textContent).toBe("Apostila");
  });

  it("expõe o progresso de leitura na barra do topo", () => {
    render(<MateriaLeituraPage materiaId="mat1" />);

    const barra = screen.getByRole("progressbar", { name: "Progresso de leitura" });
    expect(barra.getAttribute("aria-valuenow")).toBe("42");
  });
});
