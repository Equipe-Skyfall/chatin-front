// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResumosRevisadosCard } from "@/components/progresso_components/resumos_revisados_card";

describe("ResumosRevisadosCard", () => {
  it("mostra o total de revisões registradas", () => {
    render(<ResumosRevisadosCard total={7} />);

    expect(screen.getByRole("heading", { name: "Resumos revisados" })).toBeInTheDocument();
    expect(screen.getByText(/Você fez 7 revisões de resumos da sua biblioteca/)).toBeInTheDocument();
  });

  it("usa o singular com uma única revisão", () => {
    render(<ResumosRevisadosCard total={1} />);

    expect(screen.getByText(/Você fez 1 revisão de resumos/)).toBeInTheDocument();
  });

  it("convida a abrir um resumo quando ainda não há revisões", () => {
    render(<ResumosRevisadosCard total={0} />);

    expect(screen.getByText(/Abra um resumo da Biblioteca/)).toBeInTheDocument();
    expect(screen.queryByText(/Você fez/)).not.toBeInTheDocument();
  });
});
