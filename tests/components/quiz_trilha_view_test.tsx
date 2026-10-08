// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

function noDoModulo(titulo: string): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(`^${titulo} —`) });
}

describe("TrilhaView (caminho de módulos)", () => {
  beforeAll(() => {
    // jsdom não implementa scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("não renderiza nada enquanto a trilha não carregou", () => {
    const { container } = render(<TrilhaView trilha={null} onPraticar={vi.fn()} onConcluir={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("mostra aviso quando não há matérias", () => {
    render(<TrilhaView trilha={{ materias: [] }} onPraticar={vi.fn()} onConcluir={vi.fn()} />);

    expect(screen.getByText("Nenhuma matéria disponível ainda.")).toBeInTheDocument();
  });

  it("mostra matéria, tema, progresso e o estado de cada módulo no caminho", () => {
    render(<TrilhaView trilha={trilha} onPraticar={vi.fn()} onConcluir={vi.fn()} />);

    expect(screen.getByText("Matemática")).toBeInTheDocument();
    expect(screen.getByText("Álgebra")).toBeInTheDocument();
    expect(screen.getByText("1 de 3 módulos")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "33");
    expect(noDoModulo("Equações")).toHaveAttribute("data-estado", "concluido");
    expect(noDoModulo("Inequações")).toHaveAttribute("data-estado", "disponivel");
    expect(noDoModulo("Funções")).toHaveAttribute("data-estado", "bloqueado");
  });

  it("módulo bloqueado mostra o cadeado e não oferece nenhum botão de quiz", () => {
    render(<TrilhaView trilha={trilha} onPraticar={vi.fn()} onConcluir={vi.fn()} />);

    expect(noDoModulo("Funções").querySelector("svg.lucide-lock")).not.toBeNull();
    fireEvent.click(noDoModulo("Funções"));

    expect(screen.getByText("Conclua o módulo anterior para desbloquear este.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Praticar Quiz (sem XP)" })).not.toBeInTheDocument();
  });

  it("aciona prática e conclusão com id e título do módulo selecionado", () => {
    const onPraticar = vi.fn();
    const onConcluir = vi.fn();
    render(<TrilhaView trilha={trilha} onPraticar={onPraticar} onConcluir={onConcluir} />);

    fireEvent.click(noDoModulo("Inequações"));
    fireEvent.click(screen.getByRole("button", { name: "Praticar Quiz (sem XP)" }));
    fireEvent.click(screen.getByRole("button", { name: "Realizar Quiz (XP)" }));

    expect(onPraticar).toHaveBeenCalledWith("mod-2", "Inequações");
    expect(onConcluir).toHaveBeenCalledWith("mod-2", "Inequações");
  });

  it("clicar de novo no mesmo módulo recolhe as ações", async () => {
    render(<TrilhaView trilha={trilha} onPraticar={vi.fn()} onConcluir={vi.fn()} />);

    fireEvent.click(noDoModulo("Inequações"));
    expect(screen.getByRole("button", { name: "Realizar Quiz (XP)" })).toBeInTheDocument();
    fireEvent.click(noDoModulo("Inequações"));

    await waitFor(() => expect(screen.queryByRole("button", { name: "Realizar Quiz (XP)" })).not.toBeInTheDocument());
  });

  it("abre já selecionado o módulo destacado (vindo da tela de progresso)", () => {
    render(<TrilhaView trilha={trilha} onPraticar={vi.fn()} onConcluir={vi.fn()} highlightModuloId="mod-2" />);

    expect(screen.getByRole("button", { name: "Realizar Quiz (XP)" })).toBeInTheDocument();
  });
});
