// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TrocarMateriaModal } from "@/components/chat_components/trocar_materia_modal";
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

function renderizar(extra: Partial<Parameters<typeof TrocarMateriaModal>[0]> = {}) {
  const handlers = { onClose: vi.fn(), onIniciar: vi.fn(), onSeguirSemTema: vi.fn() };
  render(<TrocarMateriaModal open materias={materias} carregando={false} {...handlers} {...extra} />);
  return handlers;
}

describe("TrocarMateriaModal", () => {
  it("fechado não renderiza", () => {
    renderizar({ open: false });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("lista as trilhas e mostra o caminho da escolhida", () => {
    renderizar();

    expect(screen.queryByText(/Toque no ▶/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /História/ }));

    expect(screen.getByText(/Toque no ▶ para estudar em História/)).toBeInTheDocument();
  });

  it("abre direto a trilha vinda do Explorar", () => {
    renderizar({ materiaInicialId: "mat1" });

    expect(screen.getByText(/Toque no ▶ para estudar em História/)).toBeInTheDocument();
  });

  it("Seguir sem tema e o link do Explorar", () => {
    const { onSeguirSemTema } = renderizar();

    fireEvent.click(screen.getByRole("button", { name: "Seguir sem tema" }));

    expect(onSeguirSemTema).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: /Explorar mais trilhas/ })).toHaveAttribute("href", "/explorar");
  });

  it("sem trilhas convida a explorar", () => {
    renderizar({ materias: [] });

    expect(screen.getByText(/ainda não estuda nenhuma trilha/)).toBeInTheDocument();
  });

  it("mostra o carregando", () => {
    renderizar({ carregando: true });

    expect(screen.getByText("Carregando trilha...")).toBeInTheDocument();
  });
});
