// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MediaAcertoCard } from "@/components/progresso_components/media_acerto_card";

describe("MediaAcertoCard", () => {
  it("mostra a média arredondada e quantas respostas a compõem", () => {
    render(<MediaAcertoCard media={72.5} totalRespostas={40} />);

    expect(screen.getByRole("heading", { name: "Média de acerto" })).toBeInTheDocument();
    expect(screen.getByText("73%")).toBeInTheDocument();
    expect(screen.getByText(/Você acertou 73% das 40 respostas/)).toBeInTheDocument();
  });

  it("usa o singular com uma única resposta", () => {
    render(<MediaAcertoCard media={100} totalRespostas={1} />);

    expect(screen.getByText(/das 1 resposta em seus questionários/)).toBeInTheDocument();
  });

  it("mostra o estado vazio enquanto não há respostas", () => {
    render(<MediaAcertoCard media={null} totalRespostas={0} />);

    expect(screen.getByText("Responda um questionário para ver sua média de acerto.")).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
