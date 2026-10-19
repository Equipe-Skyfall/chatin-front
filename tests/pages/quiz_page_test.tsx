// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  getTrilha: vi.fn(),
  iniciarTentativaModulo: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/lib/quizApi", () => ({
  getTrilha: mocks.getTrilha,
  gerarQuestionarioPersonalizado: vi.fn(),
  iniciarTentativaModulo: mocks.iniciarTentativaModulo,
  responderTentativa: vi.fn(),
}));
vi.mock("@/hooks/use_xp_tracker", () => ({
  useXpTracker: () => ({ executarComGanhoXp: (fn: () => unknown) => fn() }),
}));
vi.mock("@/components/sidenav_components/sidenav", () => ({ Sidenav: () => null }));
vi.mock("@/components/layout_components/app_header", () => ({ AppHeader: () => null }));
vi.mock("@/components/quiz_components/quiz_materia_card", () => ({
  QuizMateriaCard: ({ materia, onAbrir }: { materia: { nome: string }; onAbrir: () => void }) => (
    <button type="button" onClick={onAbrir}>
      abrir {materia.nome}
    </button>
  ),
}));
vi.mock("@/components/quiz_components/quiz_materia_detalhe", () => ({
  QuizMateriaDetalhe: ({
    onConcluir,
    erro,
  }: {
    onConcluir: (id: string, titulo: string) => void;
    erro?: string | null;
  }) => (
    <div>
      <button type="button" onClick={() => onConcluir("mod1", "Causas")}>
        realizar quiz
      </button>
      {erro && <p>{erro}</p>}
    </div>
  ),
}));

import QuizPage from "@/app/quiz/quiz_page";

const trilha = {
  materias: [
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
  ],
};

async function abrirQuiz() {
  render(<QuizPage />);
  fireEvent.click(await screen.findByRole("button", { name: "abrir História" }));
  fireEvent.click(await screen.findByRole("button", { name: "realizar quiz" }));
}

beforeEach(() => {
  mocks.push.mockReset();
  mocks.getTrilha.mockReset().mockResolvedValue(trilha);
  mocks.iniciarTentativaModulo.mockReset();
});

describe("QuizPage - lição obrigatória", () => {
  it("sem a lição do módulo, leva o aluno ao chat com o botão Começar lição", async () => {
    mocks.iniciarTentativaModulo.mockRejectedValue(
      new ApiError("Comece a lição.", 403, "Comece a lição.", "LICAO_NAO_INICIADA", {
        modulo_id: "mod1",
      })
    );

    await abrirQuiz();

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/chat?modulo=mod1&comecar=1"));
    expect(screen.queryByText("Comece a lição.")).toBeNull();
  });

  it("outros erros continuam aparecendo na tela do quiz, sem redirecionar", async () => {
    mocks.iniciarTentativaModulo.mockRejectedValue(new ApiError("Este módulo está bloqueado.", 403));

    await abrirQuiz();

    expect(await screen.findByText("Este módulo está bloqueado.")).toBeTruthy();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
