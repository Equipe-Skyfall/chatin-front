// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { TrilhaSeletor } from "@/components/chat_components/trilha_seletor";
import type { TrilhaMateria } from "@/interfaces/chat_interfaces";

const materias: TrilhaMateria[] = [
  {
    id: "mat1",
    nome: "História",
    temas: [
      {
        id: "t1",
        titulo: "Revolução Francesa",
        ordem: 1,
        estado: "disponivel",
        modulos: [
          { id: "m1", titulo: "Antigo Regime", ordem: 1, estado: "concluido" },
          { id: "m2", titulo: "Queda da Bastilha", ordem: 2, estado: "disponivel" },
        ],
      },
    ],
  },
  { id: "mat2", nome: "Geografia", temas: [] },
];

function renderizar(moduloId: string | null = null, extra: Partial<Parameters<typeof TrilhaSeletor>[0]> = {}) {
  const onSelecionar = vi.fn();
  const onLimpar = vi.fn();
  render(
    <TrilhaSeletor
      materias={materias}
      moduloId={moduloId}
      carregando={false}
      onSelecionar={onSelecionar}
      onLimpar={onLimpar}
      {...extra}
    />
  );
  return { onSelecionar, onLimpar };
}

describe("TrilhaSeletor", () => {
  beforeAll(() => {
    // jsdom não implementa scrollIntoView (usado ao destacar o módulo escolhido).
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("mostra o aviso de carregando", () => {
    renderizar(null, { carregando: true });

    expect(screen.getByText("Carregando trilha...")).toBeInTheDocument();
  });

  it("avisa quando não há matérias", () => {
    renderizar(null, { materias: [] });

    expect(screen.getByText(/Nenhuma matéria disponível/)).toBeInTheDocument();
  });

  it("clicar num nó e em 'Conversar' escolhe matéria, tema e módulo", () => {
    const { onSelecionar } = renderizar();

    fireEvent.click(screen.getByRole("button", { name: /História/ }));
    fireEvent.click(screen.getByRole("button", { name: /Queda da Bastilha/ }));
    fireEvent.click(screen.getByRole("button", { name: "Conversar sobre este módulo" }));

    expect(onSelecionar).toHaveBeenCalledWith("mat1", "t1", "m2");
  });

  it("mostra o módulo escolhido e permite removê-lo", () => {
    const { onLimpar } = renderizar("m1");

    expect(screen.getByText(/Módulo:/)).toHaveTextContent("Módulo: Antigo Regime");
    fireEvent.click(screen.getByRole("button", { name: "Conversar sem módulo" }));

    expect(onLimpar).toHaveBeenCalledOnce();
  });

  it("mostra os cartões das trilhas com progresso e só abre os caminhos ao escolher uma", () => {
    renderizar();

    expect(screen.getByRole("progressbar", { name: "Progresso em História" })).toHaveAttribute("aria-valuenow", "50");
    expect(screen.queryByText("Revolução Francesa")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /História/ }));
    expect(screen.getByText("Revolução Francesa")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Geografia/ }));
    expect(screen.queryByText("Revolução Francesa")).not.toBeInTheDocument();
  });
});
