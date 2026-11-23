// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  progresso: {} as Record<string, unknown>,
  ranking: {} as Record<string, unknown>,
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/hooks/use_progresso", () => ({ useProgresso: () => mocks.progresso }));
vi.mock("@/hooks/use_ranking", () => ({ useRanking: () => mocks.ranking }));
vi.mock("@/components/sidenav_components/sidenav", () => ({ Sidenav: () => null }));
vi.mock("@/components/layout_components/app_header", () => ({ AppHeader: () => null }));

import ProgressoPage from "@/app/progresso/progresso_page";

const materia = () => ({
  materia_id: "m1",
  nome: "História",
  estado: "disponivel",
  percentual_completo: 0,
  xp: 10,
  temas: [],
});

function montar({ materias = [materia()], revisoes = 0, carregando = false, erro = false } = {}) {
  mocks.progresso = {
    materias,
    mediaAcerto: null,
    totalRespostas: 0,
    resumosRevisados: revisoes,
    carregando,
    erro,
    materiaSelecionada: null,
    temaAbertoId: null,
    abrirMateria: vi.fn(),
    fecharMateria: vi.fn(),
    alternarTema: vi.fn(),
    recarregar: vi.fn(),
  };
  mocks.ranking = {
    ranking: { entradas: [], minha_posicao: null },
    carregando: false,
    erro: false,
    podeExpandir: false,
    expandir: vi.fn(),
    recarregar: vi.fn(),
  };
}

beforeEach(() => {
  montar();
});

describe("ProgressoPage - resumos revisados", () => {
  it("mostra o total de revisões de resumos da biblioteca", () => {
    montar({ revisoes: 4 });
    render(<ProgressoPage />);

    expect(screen.getByRole("heading", { name: "Resumos revisados" })).toBeInTheDocument();
    expect(screen.getByText(/Você fez 4 revisões de resumos/)).toBeInTheDocument();
  });

  it("mostra o estado vazio quando o aluno ainda não revisou resumos", () => {
    montar({ revisoes: 0 });
    render(<ProgressoPage />);

    expect(screen.getByText(/Abra um resumo da Biblioteca/)).toBeInTheDocument();
  });
});
