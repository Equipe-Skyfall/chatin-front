// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TrilhaView } from "@/components/quiz_components/trilha_view";
import type { Trilha } from "@/schemas/quiz";

const trilha: Trilha = {
  materias: [
    {
      id: "m1",
      nome: "Matemática",
      temas: [
        {
          id: "t1",
          titulo: "Álgebra",
          ordem: 1,
          estado: "disponivel",
          modulos: [
            { id: "mod-1", titulo: "Equações", ordem: 1, estado: "concluido" },
            { id: "mod-2", titulo: "Inequações", ordem: 2, estado: "disponivel" },
            { id: "mod-3", titulo: "Funções", ordem: 3, estado: "bloqueado" },
          ],
        },
      ],
    },
  ],
};

function linhaDoModulo(titulo: string): HTMLElement {
  return screen.getByText(titulo).closest("div.flex.items-center.justify-between") as HTMLElement;
}

describe("TrilhaView (hub de questionários)", () => {
  it("não renderiza nada enquanto a trilha não carregou", () => {
    const { container } = render(<TrilhaView trilha={null} onPraticar={vi.fn()} onConcluir={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("mostra aviso quando não há matérias", () => {
    render(<TrilhaView trilha={{ materias: [] }} onPraticar={vi.fn()} onConcluir={vi.fn()} />);

    expect(screen.getByText("Nenhuma matéria disponível ainda.")).toBeInTheDocument();
  });

  it("lista matérias, temas e o estado de cada módulo", () => {
    render(<TrilhaView trilha={trilha} onPraticar={vi.fn()} onConcluir={vi.fn()} />);

    expect(screen.getByText("Matemática")).toBeInTheDocument();
    expect(screen.getByText("Álgebra")).toBeInTheDocument();
    expect(linhaDoModulo("Equações")).toHaveTextContent("Concluído");
    expect(linhaDoModulo("Inequações")).toHaveTextContent("Disponível");
    expect(linhaDoModulo("Funções")).toHaveTextContent("Bloqueado");
  });

  it("módulo bloqueado não oferece nenhum botão de quiz", () => {
    render(<TrilhaView trilha={trilha} onPraticar={vi.fn()} onConcluir={vi.fn()} />);

    expect(linhaDoModulo("Funções").querySelectorAll("button")).toHaveLength(0);
    expect(screen.getAllByRole("button", { name: "Praticar Quiz (sem XP)" })).toHaveLength(2);
  });

  it("aciona prática e conclusão com id e título do módulo", () => {
    const onPraticar = vi.fn();
    const onConcluir = vi.fn();
    render(<TrilhaView trilha={trilha} onPraticar={onPraticar} onConcluir={onConcluir} />);

    const linha = linhaDoModulo("Inequações");
    fireEvent.click(linha.querySelector("button:first-of-type")!);
    fireEvent.click(linha.querySelector("button:last-of-type")!);

    expect(onPraticar).toHaveBeenCalledWith("mod-2", "Inequações");
    expect(onConcluir).toHaveBeenCalledWith("mod-2", "Inequações");
  });
});
