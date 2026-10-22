// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
          { id: "m3", titulo: "Era napoleônica", ordem: 3, estado: "bloqueado" },
        ],
      },
    ],
  },
  { id: "mat2", nome: "Geografia", temas: [] },
];

function renderizar(extra: Partial<Parameters<typeof TrilhaSeletor>[0]> = {}) {
  const onIniciar = vi.fn();
  const onSeguirSemTema = vi.fn();
  render(
    <TrilhaSeletor
      materias={materias}
      carregando={false}
      onIniciar={onIniciar}
      onSeguirSemTema={onSeguirSemTema}
      {...extra}
    />
  );
  return { onIniciar, onSeguirSemTema };
}

describe("TrilhaSeletor", () => {
  it("mostra o aviso de carregando", () => {
    renderizar({ carregando: true });

    expect(screen.getByText("Carregando trilha...")).toBeInTheDocument();
  });

  it("avisa quando não há matérias, mas ainda permite seguir sem tema", () => {
    const { onSeguirSemTema } = renderizar({ materias: [] });

    expect(screen.getByText(/ainda não estuda nenhuma trilha/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Seguir sem tema" }));
    expect(onSeguirSemTema).toHaveBeenCalledOnce();
  });

  it("mostra os cartões das trilhas com progresso e só abre os caminhos ao escolher uma", () => {
    renderizar();

    expect(screen.getByRole("progressbar", { name: "Progresso em História" })).toHaveAttribute("aria-valuenow", "33");
    expect(screen.queryByText("Revolução Francesa")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /História/ }));
    expect(screen.getByText("Revolução Francesa")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Geografia/ }));
    expect(screen.queryByText("Revolução Francesa")).not.toBeInTheDocument();
  });

  it("tocar no ▶ de um módulo desbloqueado inicia a sessão com matéria, tema e módulo", () => {
    const { onIniciar } = renderizar();

    fireEvent.click(screen.getByRole("button", { name: /História/ }));
    fireEvent.click(screen.getByRole("button", { name: /Queda da Bastilha/ }));

    expect(onIniciar).toHaveBeenCalledWith("mat1", "t1", "m2");
  });

  it("não inicia a sessão num módulo bloqueado", () => {
    const { onIniciar } = renderizar();

    fireEvent.click(screen.getByRole("button", { name: /História/ }));
    fireEvent.click(screen.getByRole("button", { name: /Era napoleônica/ }));

    expect(onIniciar).not.toHaveBeenCalled();
  });

  it("abre direto a trilha vinda do Explorar/Início", () => {
    renderizar({ materiaInicialId: "mat1" });

    expect(screen.getByText(/2\. Toque no ▶ para estudar em História/)).toBeInTheDocument();
  });

  it("liga de volta ao Explorar", () => {
    renderizar();

    expect(screen.getByRole("link", { name: /Explorar mais trilhas/ })).toHaveAttribute("href", "/explorar");
  });
});
