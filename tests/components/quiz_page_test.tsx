// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api";
import type { TentativaIniciar } from "@/schemas/quiz";

const mocks = vi.hoisted(() => ({
  getTrilha: vi.fn(),
  gerarQuestionarioPersonalizado: vi.fn(),
  iniciarTentativaModulo: vi.fn(),
  responderTentativa: vi.fn(),
  marcarIaDisponivel: vi.fn(),
  marcarIaIndisponivel: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/lib/quizApi", () => ({
  getTrilha: mocks.getTrilha,
  gerarQuestionarioPersonalizado: mocks.gerarQuestionarioPersonalizado,
  iniciarTentativaModulo: mocks.iniciarTentativaModulo,
  responderTentativa: mocks.responderTentativa,
}));
vi.mock("@/hooks/use_xp_tracker", () => ({
  useXpTracker: () => ({ executarComGanhoXp: <T,>(acao: () => Promise<T>) => acao() }),
}));
vi.mock("@/hooks/use_ia_status", () => ({
  marcarIaDisponivel: mocks.marcarIaDisponivel,
  marcarIaIndisponivel: mocks.marcarIaIndisponivel,
}));
vi.mock("@/components/layout_components/app_header", () => ({ AppHeader: () => null }));
vi.mock("@/components/sidenav_components/sidenav", () => ({ Sidenav: () => null }));

vi.mock("@/components/quiz_components/quiz_materia_card", () => ({
  QuizMateriaCard: ({ materia, onAbrir }: { materia: { nome: string }; onAbrir: () => void }) => (
    <button onClick={onAbrir}>{materia.nome}</button>
  ),
}));

vi.mock("@/components/quiz_components/quiz_materia_detalhe", () => ({
  QuizMateriaDetalhe: ({
    tentativa,
    onPraticar,
    onConcluir,
    onResponder,
  }: {
    tentativa: TentativaIniciar | null;
    onPraticar: (id: string, titulo: string) => void;
    onConcluir: (id: string, titulo: string) => void;
    onResponder: (respostas: Record<string, string>) => void;
  }) => (
    <>
      <span>{tentativa ? "tem-tentativa" : "sem-tentativa"}</span>
      <button onClick={() => onPraticar("mod1", "Módulo 1")}>Praticar</button>
      <button onClick={() => onConcluir("mod1", "Módulo 1")}>Concluir</button>
      <button onClick={() => onResponder({ q1: "A" })}>Responder</button>
    </>
  ),
}));

import QuizPage from "@/app/quiz/quiz_page";

const trilha = { materias: [{ id: "mat1", nome: "Matemática", temas: [] }] };

const tentativa: TentativaIniciar = {
  tentativa_id: "tt1",
  questoes: [],
  pratica: true,
  questionario_id: null,
  tema_id: null,
};

async function abrirMateria() {
  render(<QuizPage />);

  fireEvent.click(await screen.findByRole("button", { name: "Matemática" }));
  return screen.findByRole("button", { name: "Praticar" });
}

beforeEach(() => {
  mocks.getTrilha.mockResolvedValue(trilha);
  mocks.gerarQuestionarioPersonalizado.mockReset();
  mocks.iniciarTentativaModulo.mockReset();
  mocks.responderTentativa.mockReset();
});

describe("QuizPage - o aviso de IA só reage a operações de IA", () => {
  it("questionário personalizado (IA) que falha com 5xx acende o aviso", async () => {
    mocks.gerarQuestionarioPersonalizado.mockRejectedValue(new ApiError("x", 503));
    await abrirMateria();

    fireEvent.click(screen.getByRole("button", { name: "Praticar" }));

    await waitFor(() => expect(mocks.marcarIaIndisponivel).toHaveBeenCalled());
    expect(mocks.marcarIaDisponivel).not.toHaveBeenCalled();
  });

  it("quiz já salvo (não-IA) que falha com 5xx NÃO acende o aviso", async () => {
    mocks.iniciarTentativaModulo.mockRejectedValue(new ApiError("x", 503));
    await abrirMateria();

    fireEvent.click(screen.getByRole("button", { name: "Concluir" }));

    await waitFor(() => expect(mocks.iniciarTentativaModulo).toHaveBeenCalled());
    expect(mocks.marcarIaIndisponivel).not.toHaveBeenCalled();
    expect(mocks.marcarIaDisponivel).not.toHaveBeenCalled();
  });

  it("questionário personalizado bem-sucedido recupera o estado da IA", async () => {
    mocks.gerarQuestionarioPersonalizado.mockResolvedValue(tentativa);
    await abrirMateria();

    fireEvent.click(screen.getByRole("button", { name: "Praticar" }));

    await waitFor(() => expect(mocks.marcarIaDisponivel).toHaveBeenCalled());
    expect(mocks.marcarIaIndisponivel).not.toHaveBeenCalled();
  });

  it("responder (correção determinística) não mexe no aviso de IA", async () => {
    mocks.gerarQuestionarioPersonalizado.mockResolvedValue(tentativa);
    mocks.responderTentativa.mockRejectedValue(new ApiError("x", 503));
    await abrirMateria();

    fireEvent.click(screen.getByRole("button", { name: "Praticar" }));
    await screen.findByText("tem-tentativa");

    fireEvent.click(screen.getByRole("button", { name: "Responder" }));

    await waitFor(() => expect(mocks.responderTentativa).toHaveBeenCalled());
    expect(mocks.marcarIaIndisponivel).not.toHaveBeenCalled();
  });
});
