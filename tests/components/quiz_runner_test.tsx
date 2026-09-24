// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QuizRunner } from "@/components/quiz_components/quiz_runner";
import type { TentativaIniciar } from "@/schemas/quiz";

function tentativa(pratica: boolean): TentativaIniciar {
  return {
    tentativa_id: "t1",
    pratica,
    questionario_id: null,
    tema_id: null,
    questoes: [
      {
        id: "q1",
        ordem: 1,
        enunciado: "Quanto é 2 + 2?",
        alternativas: [
          { letra: "A", texto: "3" },
          { letra: "B", texto: "4" },
        ],
      },
      {
        id: "q2",
        ordem: 2,
        enunciado: "Capital do Brasil?",
        alternativas: [
          { letra: "A", texto: "Brasília" },
          { letra: "B", texto: "Rio" },
        ],
      },
    ],
  };
}

const enviar = () => screen.getByRole("button", { name: "Enviar respostas" });

describe("QuizRunner (responder questionário)", () => {
  it("mostra enunciados e alternativas", () => {
    render(<QuizRunner moduloTitulo="Álgebra" tentativa={tentativa(true)} onEnviar={vi.fn()} onVoltar={vi.fn()} />);

    expect(screen.getByText("Quanto é 2 + 2?")).toBeInTheDocument();
    expect(screen.getByText("Capital do Brasil?")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
  });

  it("diferencia prática de conclusão (que vale XP)", () => {
    const { rerender } = render(
      <QuizRunner moduloTitulo="Álgebra" tentativa={tentativa(true)} onEnviar={vi.fn()} onVoltar={vi.fn()} />
    );
    expect(screen.getByText("Questionário de prática")).toBeInTheDocument();

    rerender(<QuizRunner moduloTitulo="Álgebra" tentativa={tentativa(false)} onEnviar={vi.fn()} onVoltar={vi.fn()} />);
    expect(screen.getByText("Questionário de conclusão (vale XP)")).toBeInTheDocument();
  });

  it("só libera o envio depois de responder todas as questões", () => {
    render(<QuizRunner moduloTitulo="Álgebra" tentativa={tentativa(true)} onEnviar={vi.fn()} onVoltar={vi.fn()} />);
    const [q1b] = screen.getAllByRole("radio", { name: /4/ });
    const [q2a] = screen.getAllByRole("radio", { name: /Brasília/ });

    expect(enviar()).toBeDisabled();
    fireEvent.click(q1b);
    expect(enviar()).toBeDisabled();
    fireEvent.click(q2a);
    expect(enviar()).toBeEnabled();
  });

  it("envia a letra escolhida por questão, respeitando a última troca", () => {
    const onEnviar = vi.fn();
    render(<QuizRunner moduloTitulo="Álgebra" tentativa={tentativa(false)} onEnviar={onEnviar} onVoltar={vi.fn()} />);

    fireEvent.click(screen.getByRole("radio", { name: /3/ }));
    fireEvent.click(screen.getByRole("radio", { name: /4/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Rio/ }));
    fireEvent.click(enviar());

    expect(onEnviar).toHaveBeenCalledWith({ q1: "B", q2: "B" });
  });

  it("botão voltar chama onVoltar", () => {
    const onVoltar = vi.fn();
    render(<QuizRunner moduloTitulo="Álgebra" tentativa={tentativa(true)} onEnviar={vi.fn()} onVoltar={onVoltar} />);

    fireEvent.click(screen.getByRole("button", { name: "voltar" }));

    expect(onVoltar).toHaveBeenCalled();
  });
});
