// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MateriaCard } from "@/components/materias_components/materia_card";
import type { Materia } from "@/lib/materias";

const materia: Materia = {
  id: "mat1",
  nome: "História",
  descricao: "Revoluções",
  owner_user_id: "u1",
  votos: 3,
  created_at: "2026-01-01T00:00:00Z",
};

describe("MateriaCard", () => {
  it("abre a apostila ao clicar no card", () => {
    const onAbrir = vi.fn();

    render(<MateriaCard materia={materia} onAbrir={onAbrir} />);
    fireEvent.click(screen.getByRole("button", { name: /História/ }));

    expect(onAbrir).toHaveBeenCalledTimes(1);
  });

  it("não mostra ações quando a apostila não é do aluno", () => {
    render(<MateriaCard materia={materia} onAbrir={vi.fn()} onEditar={vi.fn()} onExcluir={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Conteúdo" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Excluir" })).toBeNull();
  });

  it("mostra e dispara as ações do dono", () => {
    const onEditar = vi.fn();
    const onGerenciarConteudo = vi.fn();
    const onExcluir = vi.fn();

    render(
      <MateriaCard
        materia={materia}
        onAbrir={vi.fn()}
        podeGerenciar
        onEditar={onEditar}
        onGerenciarConteudo={onGerenciarConteudo}
        onExcluir={onExcluir}
      />
    );

    expect(screen.getByText("Sua apostila")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Conteúdo" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onEditar).toHaveBeenCalledTimes(1);
    expect(onGerenciarConteudo).toHaveBeenCalledTimes(1);
    expect(onExcluir).toHaveBeenCalledTimes(1);
  });
});
