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

function render_runner(pratica = true) {
  return render(
    <QuizRunner moduloTitulo="Álgebra" tentativa={tentativa(pratica)} onEnviar={vi.fn()} onVoltar={vi.fn()} />
  );
}

const proxima = () => screen.getByRole("button", { name: "Próxima" });
const anterior = () => screen.getByRole("button", { name: "Anterior" });
const enviar = () => screen.getByRole("button", { name: "Enviar respostas" });

describe("QuizRunner (responder questionário)", () => {
  it("mostra uma questão por vez", () => {
    render_runner();

    expect(screen.getByText("Questão 1 de 2")).toBeInTheDocument();
    expect(screen.getByText("Quanto é 2 + 2?")).toBeInTheDocument();
    expect(screen.queryByText("Capital do Brasil?")).not.toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("navega para frente e para trás com Próxima/Anterior", () => {
    render_runner();

    expect(anterior()).toBeDisabled();

    fireEvent.click(proxima());
    expect(screen.getByText("Capital do Brasil?")).toBeInTheDocument();
    expect(screen.queryByText("Quanto é 2 + 2?")).not.toBeInTheDocument();

    fireEvent.click(anterior());
    expect(screen.getByText("Quanto é 2 + 2?")).toBeInTheDocument();
    expect(anterior()).toBeDisabled();
  });

  it("diferencia prática de conclusão (que vale XP)", () => {
    const { rerender } = render(
      <QuizRunner moduloTitulo="Álgebra" tentativa={tentativa(true)} onEnviar={vi.fn()} onVoltar={vi.fn()} />
    );
    expect(screen.getByText("Questionário de prática")).toBeInTheDocument();

    rerender(<QuizRunner moduloTitulo="Álgebra" tentativa={tentativa(false)} onEnviar={vi.fn()} onVoltar={vi.fn()} />);
    expect(screen.getByText("Questionário de conclusão (vale XP)")).toBeInTheDocument();
  });

  it("na última questão, Próxima vira Enviar e só libera após responder tudo", () => {
    const onEnviar = vi.fn();
    render(
      <QuizRunner moduloTitulo="Álgebra" tentativa={tentativa(false)} onEnviar={onEnviar} onVoltar={vi.fn()} />
    );

    fireEvent.click(screen.getByRole("radio", { name: /4/ }));
    fireEvent.click(proxima());

    expect(screen.queryByRole("button", { name: "Próxima" })).not.toBeInTheDocument();
    expect(enviar()).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: /Brasília/ }));
    expect(enviar()).toBeEnabled();

    fireEvent.click(enviar());
    expect(onEnviar).toHaveBeenCalledWith({ q1: "B", q2: "A" });
  });

  it("mantém as respostas ao voltar para uma questão anterior", () => {
    render_runner();

    fireEvent.click(screen.getByRole("radio", { name: /4/ }));
    fireEvent.click(proxima());
    fireEvent.click(anterior());

    expect(screen.getByRole("radio", { name: /4/ })).toBeChecked();
  });

  it("botão voltar chama onVoltar", () => {
    const onVoltar = vi.fn();
    render(<QuizRunner moduloTitulo="Álgebra" tentativa={tentativa(true)} onEnviar={vi.fn()} onVoltar={onVoltar} />);

    fireEvent.click(screen.getByRole("button", { name: "voltar" }));

    expect(onVoltar).toHaveBeenCalled();
  });
});
