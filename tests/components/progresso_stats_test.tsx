// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressoStats } from "@/components/progresso_components/progresso_stats";

const agregado = {
  totalMaterias: 3,
  materiasConcluidas: 2,
  xpTotal: 1234,
  percentualMedio: 42,
};

describe("ProgressoStats", () => {
  it("mostra os cinco indicadores, incluindo o streak atual", () => {
    render(<ProgressoStats agregado={agregado} streakAtual={4} />);

    expect(screen.getByText("Matérias")).toBeInTheDocument();
    expect(screen.getByText("Concluídas")).toBeInTheDocument();
    expect(screen.getByText("XP Total")).toBeInTheDocument();
    expect(screen.getByText("Progresso Médio")).toBeInTheDocument();
    expect(screen.getByText("Dias seguidos")).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1.234")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("Responda um quiz hoje")).not.toBeInTheDocument();
  });

  it("usa — quando o backend não envia o streak", () => {
    render(<ProgressoStats agregado={agregado} streakAtual={null} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("mostra o streak zerado e a dica de responder um quiz", () => {
    render(<ProgressoStats agregado={agregado} streakAtual={0} />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Responda um quiz hoje")).toBeInTheDocument();
  });
});
