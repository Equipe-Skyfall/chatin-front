// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QuizResultado } from "@/components/quiz_components/quiz_resultado";
import type { TentativaResultado } from "@/schemas/quiz";

const resultado: TentativaResultado = {
  id: "t1",
  questionario_id: "qz1",
  tema_id: null,
  pontuacao: 50,
  total_questoes: 2,
  total_corretas: 1,
  resultados: [
    { questao_id: "q1", resposta_escolhida: "B", resposta_correta: "B", correta: true, explicacao: null },
    { questao_id: "q2", resposta_escolhida: "A", resposta_correta: "C", correta: false, explicacao: "Veja a fórmula." },
  ],
};

describe("QuizResultado (resultado do questionário)", () => {
  it("mostra a pontuação e o total de acertos", () => {
    render(<QuizResultado moduloTitulo="Álgebra" resultado={resultado} onVoltar={vi.fn()} />);

    expect(screen.getByRole("heading")).toHaveTextContent("50% · 1/2 corretas");
  });

  it("indica acerto e erro por questão com o gabarito", () => {
    render(<QuizResultado moduloTitulo="Álgebra" resultado={resultado} onVoltar={vi.fn()} />);

    expect(screen.getByText(/Questão 1 · Você acertou/)).toBeInTheDocument();
    expect(screen.getByText(/Questão 2 · Você errou/)).toBeInTheDocument();
    expect(screen.getAllByText(/Gabarito:/)[1]).toHaveTextContent("Sua resposta: A · Gabarito: C");
  });

  it("mostra a explicação só quando existe", () => {
    render(<QuizResultado moduloTitulo="Álgebra" resultado={resultado} onVoltar={vi.fn()} />);

    expect(screen.getAllByText("Veja a fórmula.")).toHaveLength(1);
  });

  it("arredonda a pontuação", () => {
    render(<QuizResultado moduloTitulo="Álgebra" resultado={{ ...resultado, pontuacao: 66.666 }} onVoltar={vi.fn()} />);

    expect(screen.getByRole("heading")).toHaveTextContent("67%");
  });

  it("volta para a trilha", () => {
    const onVoltar = vi.fn();
    render(<QuizResultado moduloTitulo="Álgebra" resultado={resultado} onVoltar={onVoltar} />);

    fireEvent.click(screen.getByRole("button", { name: "voltar pra trilha" }));

    expect(onVoltar).toHaveBeenCalled();
  });
});
