// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ progresso: {} as Record<string, unknown>, push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/hooks/use_trilha_caminhos", () => ({
  useTrilhaCaminhos: () => ({
    materias: [
      {
        id: "m1",
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
    ],
  }),
}));
vi.mock("@/hooks/use_progresso", () => ({ useProgresso: () => mocks.progresso }));
vi.mock("@/components/sidenav_components/sidenav", () => ({ Sidenav: () => null }));
vi.mock("@/components/layout_components/app_header", () => ({ AppHeader: () => null }));

import InicioPage from "@/app/inicio/inicio_page";

const materia = (percentual: number) => ({
  materia_id: "m1",
  nome: "História",
  estado: "disponivel",
  percentual_completo: percentual,
  xp: 10,
  temas: [],
});

function montar(extra: Record<string, unknown> = {}) {
  mocks.progresso = { materias: [], carregando: false, erro: false, recarregar: vi.fn(), ...extra };
}

beforeEach(() => {
  mocks.push.mockReset();
  montar();
});

describe("InicioPage", () => {
  it("destaca Explorar trilhas com link para a rota", () => {
    render(<InicioPage />);

    expect(screen.getByRole("link", { name: /Explorar trilhas/ })).toHaveAttribute("href", "/explorar");
    expect(screen.queryByRole("link", { name: /Conversar com o CHATin/ })).toBeNull();
  });

  it("cada trilha tem Conversar, que abre o chat na trilha em vez de ir ao progresso", () => {
    montar({ materias: [materia(40)] });
    render(<InicioPage />);

    fireEvent.click(screen.getByRole("button", { name: "Conversar sobre História" }));

    expect(mocks.push).toHaveBeenCalledWith("/chat?trilha=m1");
    expect(mocks.push).not.toHaveBeenCalledWith("/progresso");
  });

  it("sem trilhas estudadas convida a explorar", () => {
    render(<InicioPage />);

    expect(screen.getByText(/ainda não está estudando nenhuma trilha/)).toBeInTheDocument();
  });

  it("lista as trilhas e mostra continuar estudando na que está em andamento", () => {
    montar({ materias: [materia(40)] });
    render(<InicioPage />);

    expect(screen.getByText("Continue estudando")).toBeInTheDocument();
    expect(screen.getByText("1 no total")).toBeInTheDocument();
  });

  it("erro permite tentar de novo", () => {
    const recarregar = vi.fn();
    montar({ erro: true, recarregar });
    render(<InicioPage />);

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(recarregar).toHaveBeenCalled();
  });

  it("Ver caminho mostra o caminho da trilha e o ▶ abre a leitura do módulo na apostila", () => {
    montar({ materias: [materia(40)] });
    render(<InicioPage />);

    fireEvent.click(screen.getByRole("button", { name: "Ver caminho de História" }));

    expect(screen.getByText(/Toque no ▶ para ler em História/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Causas/ }));
    expect(mocks.push).toHaveBeenCalledWith("/apostilas/m1?modulo=mod1");
  });
});
